import { createContext, useContext, useState, useEffect } from 'react';
import { FREE_SEND_CREDITS } from '../data/plansData';

const AuthContext = createContext();

function loadFromStorage(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch { return fallback; }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadFromStorage('emprega_user', null));
  const [registeredUsers, setRegisteredUsers] = useState(() => loadFromStorage('emprega_users', []));

  useEffect(() => {
    localStorage.setItem('emprega_users', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  useEffect(() => {
    if (user) localStorage.setItem('emprega_user', JSON.stringify(user));
    else localStorage.removeItem('emprega_user');
  }, [user]);

  const isLoggedIn = !!user;

  const register = (nome, email, senha) => {
    const exists = registeredUsers.find((u) => u.email === email);
    if (exists) return { success: false, error: 'Este email já está cadastrado.' };
    const newUser = {
      id: Date.now(),
      nome,
      email,
      senha,
      role: 'user',
      sendCredits: FREE_SEND_CREDITS,
      autoDispatchAccess: false,
      dailyDispatchLimit: 0,
      dailyDispatchUsed: 0,
      dailyDispatchUnlimited: false,
      lastDispatchDate: null,
      purchaseHistory: [],
    };
    setRegisteredUsers((prev) => [...prev, newUser]);
    setUser(newUser);
    return { success: true };
  };

  const login = (email, senha) => {
    const found = registeredUsers.find((u) => u.email === email && u.senha === senha);
    if (!found) return { success: false, error: 'Email ou senha incorretos.' };
    const today = new Date().toDateString();
    const updated = { ...found };
    if (updated.lastDispatchDate !== today) {
      updated.dailyDispatchUsed = 0;
      updated.lastDispatchDate = today;
    }
    setUser(updated);
    return { success: true };
  };

  const logout = () => setUser(null);

  const _updateUser = (updates) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      setRegisteredUsers((ru) => ru.map((u) => (u.id === prev.id ? { ...u, ...updates } : u)));
      return updated;
    });
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
    const limitUpdates = amount === -1 ? { dailyDispatchUnlimited: true } : { dailyDispatchLimit: (user?.dailyDispatchLimit || 0) + amount };
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
  const updateProfile = (updates) => {
    if (!user) return { success: false, error: 'Usuário não encontrado.' };
    const allowed = {};
    if (updates.nome !== undefined) allowed.nome = updates.nome;
    if (updates.telefone !== undefined) allowed.telefone = updates.telefone;
    if (updates.cidade !== undefined) allowed.cidade = updates.cidade;
    if (updates.estado !== undefined) allowed.estado = updates.estado;
    if (updates.fotoPerfil !== undefined) allowed.fotoPerfil = updates.fotoPerfil;
    _updateUser(allowed);
    return { success: true };
  };

  const changePassword = (senhaAtual, novaSenha) => {
    if (!user) return { success: false, error: 'Usuário não encontrado.' };
    if (user.senha !== senhaAtual) return { success: false, error: 'Senha atual incorreta.' };
    if (novaSenha.length < 4) return { success: false, error: 'A nova senha deve ter pelo menos 4 caracteres.' };
    _updateUser({ senha: novaSenha });
    return { success: true };
  };

  // --- Admin ---
  const getAllUsers = () => registeredUsers;

  const adminUpdateUser = (userId, updates) => {
    setRegisteredUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updates } : u)));
    if (user?.id === userId) {
      setUser((prev) => (prev ? { ...prev, ...updates } : prev));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
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
