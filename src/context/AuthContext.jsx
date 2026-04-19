import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { FREE_SEND_CREDITS } from '../data/plansData';

const AuthContext = createContext();

// Map Supabase profile row → user object (same shape the app expects)
function profileToUser(profile) {
  if (!profile) return null;
  return {
    id: profile.id,
    nome: profile.nome || '',
    email: profile.email || '',
    telefone: profile.telefone || '',
    cidade: profile.cidade || '',
    estado: profile.estado || '',
    fotoPerfil: profile.foto_perfil_url || null,
    role: profile.role || 'user',
    sendCredits: profile.send_credits ?? FREE_SEND_CREDITS,
    autoDispatchAccess: !!profile.auto_dispatch_access,
    dailyDispatchLimit: profile.daily_dispatch_limit || 0,
    dailyDispatchUsed: profile.daily_dispatch_used || 0,
    dailyDispatchUnlimited: !!profile.daily_dispatch_unlimited,
    lastDispatchDate: profile.last_dispatch_date || null,
    isPriorityUser: !!profile.is_priority_user,
    pdfDownloadAccess: !!profile.pdf_download_access,
    purchaseHistory: profile.purchase_history || [],
  };
}

// Map user updates → Supabase column names
function updatesToColumns(updates) {
  const map = {
    nome: 'nome',
    email: 'email',
    telefone: 'telefone',
    cidade: 'cidade',
    estado: 'estado',
    fotoPerfil: 'foto_perfil_url',
    sendCredits: 'send_credits',
    autoDispatchAccess: 'auto_dispatch_access',
    dailyDispatchLimit: 'daily_dispatch_limit',
    dailyDispatchUsed: 'daily_dispatch_used',
    dailyDispatchUnlimited: 'daily_dispatch_unlimited',
    lastDispatchDate: 'last_dispatch_date',
    isPriorityUser: 'is_priority_user',
    pdfDownloadAccess: 'pdf_download_access',
    purchaseHistory: 'purchase_history',
  };
  const cols = {};
  for (const [key, value] of Object.entries(updates)) {
    if (map[key] !== undefined) cols[map[key]] = value;
  }
  return cols;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  // Fetch profile from Supabase
  const fetchProfile = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) {
      console.error('Erro ao carregar perfil:', error.message);
      return null;
    }
    return profileToUser(data);
  }, []);

  // Initialize: listen for auth changes (single source of truth)
  useEffect(() => {
    mountedRef.current = true;

    // Safety timeout: never stay loading forever
    const safetyTimer = setTimeout(() => {
      if (mountedRef.current && loading) {
        console.warn('Auth: safety timeout — finishing loading');
        setLoading(false);
      }
    }, 5000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mountedRef.current) return;

      if (session?.user) {
        // For new signups, wait for trigger to create profile
        if (event === 'SIGNED_IN') {
          await new Promise((r) => setTimeout(r, 600));
        }

        let profile = await fetchProfile(session.user.id);

        // Retry once for new signups (trigger may be slow)
        if (!profile && event === 'SIGNED_IN') {
          await new Promise((r) => setTimeout(r, 1200));
          profile = await fetchProfile(session.user.id);
        }

        // Fill Google metadata if nome is empty
        if (profile && !profile.nome && session.user.user_metadata) {
          const meta = session.user.user_metadata;
          const googleName = meta.full_name || meta.name || '';
          const googleAvatar = meta.avatar_url || meta.picture || '';
          if (googleName) {
            const updates = { nome: googleName };
            if (googleAvatar) updates.foto_perfil_url = googleAvatar;
            await supabase.from('profiles').update(updates).eq('id', session.user.id);
            profile = { ...profile, nome: googleName, fotoPerfil: googleAvatar || profile.fotoPerfil };
          }
        }

        if (mountedRef.current) setUser(profile);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }

      if (mountedRef.current) setLoading(false);
    });

    return () => {
      mountedRef.current = false;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const isLoggedIn = !!user;

  // Refresh profile from DB (source of truth after RPC calls)
  const _refreshProfile = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user || !mountedRef.current) return;
    const profile = await fetchProfile(session.user.id);
    if (profile && mountedRef.current) setUser(profile);
  }, [fetchProfile]);

  // Persist SAFE field updates to Supabase (nome, telefone, cidade, estado, foto)
  const _updateSafeFields = useCallback(async (updates) => {
    if (!user) return;
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
    const cols = updatesToColumns(updates);
    if (Object.keys(cols).length > 0) {
      const { error } = await supabase
        .from('profiles')
        .update(cols)
        .eq('id', user.id);
      if (error) console.error('Erro ao atualizar perfil:', error.message);
    }
  }, [user]);

  // --- Register ---
  const register = async (nome, email, senha) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { nome } },
    });
    if (error) {
      if (error.message.includes('already registered') || error.message.includes('already been registered'))
        return { success: false, error: 'Este email já está cadastrado.' };
      return { success: false, error: error.message };
    }
    // Check if email confirmation is required
    if (data.user && data.user.identities?.length === 0) {
      return { success: false, error: 'Este email já está cadastrado.' };
    }
    if (data.user && !data.session) {
      // Email confirmation is enabled — user created but not confirmed yet
      return { success: true, needsConfirmation: true };
    }
    // Wait for profile to be created by trigger, then fetch
    if (data.user) {
      await new Promise((r) => setTimeout(r, 500));
      const profile = await fetchProfile(data.user.id);
      if (mountedRef.current) setUser(profile);
    }
    return { success: true };
  };

  // --- Login ---
  const login = async (email, senha) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });
    if (error) {
      if (error.message.includes('Email not confirmed'))
        return { success: false, error: 'Confirme seu email antes de fazer login. Verifique sua caixa de entrada.' };
      return { success: false, error: 'Email ou senha incorretos.' };
    }
    if (data.user) {
      // Reset daily dispatch server-side using DB time
      await supabase.rpc('reset_daily_dispatch_if_needed');
      const profile = await fetchProfile(data.user.id);
      if (mountedRef.current) setUser(profile);
    }
    return { success: true };
  };

  // --- Login com Google ---
  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/usuario',
      },
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  // --- Logout ---
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // --- Send credits (via secure RPC) ---
  const hasSendCredits = () => (user?.sendCredits || 0) > 0;

  const consumeSendCredit = async () => {
    if (!user || user.sendCredits <= 0) return false;
    // Optimistic update
    setUser((prev) => prev ? { ...prev, sendCredits: prev.sendCredits - 1 } : prev);
    const { data, error } = await supabase.rpc('consume_send_credit');
    if (error) {
      console.error('Erro ao consumir crédito:', error.message);
      _refreshProfile();
      return false;
    }
    if (!data) _refreshProfile();
    return !!data;
  };

  const addSendCredits = async (amount, planName, planPrice) => {
    // Optimistic update
    setUser((prev) => prev ? {
      ...prev,
      sendCredits: (prev.sendCredits || 0) + amount,
    } : prev);
    const { error } = await supabase.rpc('add_send_credits', {
      p_amount: amount,
      p_plan_name: planName,
      p_plan_price: planPrice,
    });
    if (error) console.error('Erro ao adicionar créditos:', error.message);
    _refreshProfile();
  };

  // --- Auto dispatch (via secure RPC) ---
  const hasAutoDispatchAccess = () => !!user?.autoDispatchAccess;

  const getDailyDispatchRemaining = () => {
    if (!user?.autoDispatchAccess) return 0;
    if (user.dailyDispatchUnlimited) return Infinity;
    return Math.max(0, user.dailyDispatchLimit - user.dailyDispatchUsed);
  };

  const consumeDailyDispatch = async (count) => {
    if (!user?.autoDispatchAccess) return 0;
    const { data, error } = await supabase.rpc('consume_daily_dispatch', { p_count: count });
    if (error) {
      console.error('Erro ao consumir dispatch:', error.message);
      _refreshProfile();
      return 0;
    }
    _refreshProfile();
    return data || 0;
  };

  const purchaseAutoDispatch = async (initialDailyLimit, price) => {
    setUser((prev) => prev ? { ...prev, autoDispatchAccess: true } : prev);
    const { error } = await supabase.rpc('purchase_auto_dispatch', {
      p_daily_limit: initialDailyLimit,
      p_price: price,
    });
    if (error) console.error('Erro ao comprar dispatch:', error.message);
    _refreshProfile();
  };

  const upgradeDailyLimit = async (amount, label, price) => {
    const { error } = await supabase.rpc('upgrade_daily_limit', {
      p_amount: amount,
      p_label: label,
      p_price: price,
    });
    if (error) console.error('Erro ao upgrade dispatch:', error.message);
    _refreshProfile();
  };

  // --- Priority resume (via secure RPC) ---
  const hasPurchased = () => (user?.purchaseHistory || []).length > 0;
  const isPriorityUser = () => !!user?.isPriorityUser;

  const purchasePriority = async () => {
    setUser((prev) => prev ? { ...prev, isPriorityUser: true } : prev);
    const { error } = await supabase.rpc('purchase_priority');
    if (error) console.error('Erro ao comprar prioridade:', error.message);
    _refreshProfile();
  };

  // --- PDF download access (via secure RPC) ---
  const hasPdfAccess = () => !!user?.pdfDownloadAccess;

  const purchasePdfAccess = async (price) => {
    setUser((prev) => prev ? { ...prev, pdfDownloadAccess: true } : prev);
    const { error } = await supabase.rpc('purchase_pdf_access', { p_price: price });
    if (error) console.error('Erro ao comprar PDF:', error.message);
    _refreshProfile();
  };

  // --- Profile ---
  const updateProfile = async (updates) => {
    if (!user) return { success: false, error: 'Usuário não encontrado.' };
    const allowed = {};
    if (updates.nome !== undefined) allowed.nome = updates.nome;
    if (updates.telefone !== undefined) allowed.telefone = updates.telefone;
    if (updates.cidade !== undefined) allowed.cidade = updates.cidade;
    if (updates.estado !== undefined) allowed.estado = updates.estado;
    if (updates.fotoPerfil !== undefined) allowed.fotoPerfil = updates.fotoPerfil;
    await _updateSafeFields(allowed);
    return { success: true };
  };

  const changePassword = async (senhaAtual, novaSenha) => {
    if (!user) return { success: false, error: 'Usuário não encontrado.' };
    if (novaSenha.length < 6) return { success: false, error: 'A nova senha deve ter pelo menos 6 caracteres.' };
    // Verify current password by re-authenticating
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: senhaAtual,
    });
    if (verifyError) return { success: false, error: 'Senha atual incorreta.' };
    // Update password
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  // --- Admin ---
  const getAllUsers = useCallback(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Erro ao buscar usuários:', error.message);
      return [];
    }
    return data.map(profileToUser);
  }, []);

  const adminUpdateUser = useCallback(async (userId, updates) => {
    const cols = updatesToColumns(updates);
    if (Object.keys(cols).length > 0) {
      const { error } = await supabase
        .from('profiles')
        .update(cols)
        .eq('id', userId);
      if (error) console.error('Erro ao atualizar usuário:', error.message);
    }
    // If updating self, refresh local state
    if (user?.id === userId) {
      setUser((prev) => (prev ? { ...prev, ...updates } : prev));
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isLoggedIn,
        register,
        login,
        loginWithGoogle,
        logout,
        hasSendCredits,
        consumeSendCredit,
        addSendCredits,
        hasAutoDispatchAccess,
        getDailyDispatchRemaining,
        consumeDailyDispatch,
        purchaseAutoDispatch,
        upgradeDailyLimit,
        hasPurchased,
        isPriorityUser,
        purchasePriority,
        hasPdfAccess,
        purchasePdfAccess,
        updateProfile,
        changePassword,
        getAllUsers,
        adminUpdateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
