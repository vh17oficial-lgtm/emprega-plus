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

  // Initialize: check existing session + listen for auth changes
  useEffect(() => {
    mountedRef.current = true;

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user && mountedRef.current) {
        const profile = await fetchProfile(session.user.id);
        if (mountedRef.current) setUser(profile);
      }
      if (mountedRef.current) setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (mountedRef.current) setUser(profile);
      } else if (event === 'SIGNED_OUT') {
        if (mountedRef.current) setUser(null);
      }
    });

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const isLoggedIn = !!user;

  // --- Persist updates to Supabase ---
  const _updateUser = useCallback(async (updates) => {
    if (!user) return;
    // Optimistic local update
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
    // Persist to Supabase
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
      const profile = await fetchProfile(data.user.id);
      if (profile) {
        // Reset daily dispatch if day changed
        const today = new Date().toDateString();
        if (profile.lastDispatchDate !== today) {
          profile.dailyDispatchUsed = 0;
          profile.lastDispatchDate = today;
          await supabase.from('profiles').update({
            daily_dispatch_used: 0,
            last_dispatch_date: today,
          }).eq('id', data.user.id);
        }
      }
      if (mountedRef.current) setUser(profile);
    }
    return { success: true };
  };

  // --- Logout ---
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // --- Send credits ---
  const hasSendCredits = () => (user?.sendCredits || 0) > 0;

  const consumeSendCredit = () => {
    if (!user || user.sendCredits <= 0) return false;
    _updateUser({ sendCredits: user.sendCredits - 1 });
    return true;
  };

  const addSendCredits = (amount, planName, planPrice) => {
    _updateUser({
      sendCredits: (user?.sendCredits || 0) + amount,
      purchaseHistory: [
        ...(user?.purchaseHistory || []),
        { type: 'send_credits', name: planName, amount, price: planPrice, date: new Date().toLocaleString('pt-BR') },
      ],
    });
  };

  // --- Auto dispatch ---
  const hasAutoDispatchAccess = () => !!user?.autoDispatchAccess;

  const getDailyDispatchRemaining = () => {
    if (!user?.autoDispatchAccess) return 0;
    if (user.dailyDispatchUnlimited) return Infinity;
    const today = new Date().toDateString();
    if (user.lastDispatchDate !== today) return user.dailyDispatchLimit;
    return Math.max(0, user.dailyDispatchLimit - user.dailyDispatchUsed);
  };

  const consumeDailyDispatch = (count) => {
    if (!user?.autoDispatchAccess) return 0;
    const remaining = getDailyDispatchRemaining();
    const actual = Math.min(count, remaining);
    if (actual <= 0) return 0;
    const today = new Date().toDateString();
    const newUsed = user.lastDispatchDate === today ? user.dailyDispatchUsed + actual : actual;
    _updateUser({ dailyDispatchUsed: newUsed, lastDispatchDate: today });
    return actual;
  };

  const purchaseAutoDispatch = (initialDailyLimit, price) => {
    _updateUser({
      autoDispatchAccess: true,
      dailyDispatchLimit: initialDailyLimit,
      dailyDispatchUsed: 0,
      lastDispatchDate: new Date().toDateString(),
      purchaseHistory: [
        ...(user?.purchaseHistory || []),
        { type: 'auto_dispatch', name: 'Disparador Automático', price, date: new Date().toLocaleString('pt-BR') },
      ],
    });
  };

  const upgradeDailyLimit = (amount, label, price) => {
    const limitUpdates = amount === -1
      ? { dailyDispatchUnlimited: true }
      : { dailyDispatchLimit: (user?.dailyDispatchLimit || 0) + amount };
    _updateUser({
      ...limitUpdates,
      purchaseHistory: [
        ...(user?.purchaseHistory || []),
        { type: 'dispatch_upgrade', name: label, price, date: new Date().toLocaleString('pt-BR') },
      ],
    });
  };

  // --- Priority resume ---
  const hasPurchased = () => (user?.purchaseHistory || []).length > 0;
  const isPriorityUser = () => !!user?.isPriorityUser;

  const purchasePriority = () => {
    _updateUser({
      isPriorityUser: true,
      purchaseHistory: [
        ...(user?.purchaseHistory || []),
        { type: 'priority_resume', name: 'Currículo com Prioridade', price: 9.99, date: new Date().toLocaleString('pt-BR') },
      ],
    });
  };

  // --- PDF download access ---
  const hasPdfAccess = () => !!user?.pdfDownloadAccess;

  const purchasePdfAccess = (price) => {
    _updateUser({
      pdfDownloadAccess: true,
      purchaseHistory: [
        ...(user?.purchaseHistory || []),
        { type: 'pdf_download', name: 'Download de Currículo em PDF', price, date: new Date().toLocaleString('pt-BR') },
      ],
    });
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
    await _updateUser(allowed);
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
