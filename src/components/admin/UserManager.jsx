import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function UserManager() {
  const { getAllUsers, adminUpdateUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [creditInputs, setCreditInputs] = useState({});
  const [limitInputs, setLimitInputs] = useState({});
  const [feedback, setFeedback] = useState({});

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    const data = await getAllUsers();
    setUsers(data);
    setLoadingUsers(false);
  }, [getAllUsers]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const showFeedback = (userId, msg) => {
    setFeedback((prev) => ({ ...prev, [userId]: msg }));
    setTimeout(() => setFeedback((prev) => ({ ...prev, [userId]: '' })), 2000);
  };

  const handleAddCredits = async (userId) => {
    const amount = parseInt(creditInputs[userId]) || 0;
    if (amount <= 0) return;
    const user = users.find((u) => u.id === userId);
    try {
      await adminUpdateUser(userId, { sendCredits: (user.sendCredits || 0) + amount });
      setCreditInputs((prev) => ({ ...prev, [userId]: '' }));
      showFeedback(userId, `+${amount} créditos adicionados`);
    } catch (err) {
      showFeedback(userId, `Erro: ${err.message}`);
    }
    loadUsers();
  };

  const handleToggleDispatch = async (userId) => {
    const user = users.find((u) => u.id === userId);
    try {
      await adminUpdateUser(userId, {
        autoDispatchAccess: !user.autoDispatchAccess,
        dailyDispatchLimit: !user.autoDispatchAccess ? 10 : user.dailyDispatchLimit,
      });
      showFeedback(userId, user.autoDispatchAccess ? 'Disparador desativado' : 'Disparador ativado');
    } catch (err) {
      showFeedback(userId, `Erro: ${err.message}`);
    }
    loadUsers();
  };

  const handleSetLimit = async (userId) => {
    const limit = parseInt(limitInputs[userId]) || 0;
    if (limit <= 0) return;
    try {
      await adminUpdateUser(userId, { dailyDispatchLimit: limit });
      setLimitInputs((prev) => ({ ...prev, [userId]: '' }));
      showFeedback(userId, `Limite alterado para ${limit}/dia`);
    } catch (err) {
      showFeedback(userId, `Erro: ${err.message}`);
    }
    loadUsers();
  };

  const handleSetUnlimited = async (userId) => {
    try {
      await adminUpdateUser(userId, { dailyDispatchUnlimited: true });
      showFeedback(userId, 'Limite ilimitado ativado');
    } catch (err) {
      showFeedback(userId, `Erro: ${err.message}`);
    }
    loadUsers();
  };

  const inputClass = 'px-3 py-1.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none';

  if (loadingUsers) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Gestão de Usuários</h3>
          <p className="text-sm text-gray-500 mt-1">Carregando...</p>
        </div>
        <div className="text-center py-12 text-gray-400">
          <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Gestão de Usuários</h3>
          <p className="text-sm text-gray-500 mt-1">Gerencie créditos e acessos dos usuários.</p>
        </div>
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">👥</div>
          <p className="text-sm font-medium">Nenhum usuário cadastrado ainda.</p>
          <p className="text-xs mt-1">Os usuários aparecerão aqui após se cadastrarem.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Gestão de Usuários</h3>
        <p className="text-sm text-gray-500 mt-1">{users.length} usuário(s) cadastrado(s)</p>
      </div>

      <div className="space-y-4">
        {users.map((u) => (
          <div key={u.id} className="border border-gray-200 rounded-xl p-5 bg-white">
            {/* User info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
                  {u.nome?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{u.nome}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-medium">
                  📨 {u.sendCredits} envio(s)
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${u.autoDispatchAccess ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                  ⚡ {u.autoDispatchAccess
                    ? u.dailyDispatchUnlimited ? 'Ilimitado' : `${u.dailyDispatchLimit}/dia`
                    : 'Bloqueado'}
                </span>
              </div>
            </div>

            {/* Feedback */}
            {feedback[u.id] && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg px-3 py-2 mb-3">
                ✓ {feedback[u.id]}
              </div>
            )}

            {/* Actions */}
            <div className="grid sm:grid-cols-2 gap-3">
              {/* Add credits */}
              <div className="flex gap-2">
                <input
                  type="number"
                  value={creditInputs[u.id] || ''}
                  onChange={(e) => setCreditInputs((prev) => ({ ...prev, [u.id]: e.target.value }))}
                  placeholder="Qtd créditos"
                  min={1}
                  className={`${inputClass} flex-1`}
                />
                <button
                  onClick={() => handleAddCredits(u.id)}
                  className="bg-indigo-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors whitespace-nowrap"
                >
                  + Créditos
                </button>
              </div>

              {/* Toggle dispatch */}
              <button
                onClick={() => handleToggleDispatch(u.id)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                  u.autoDispatchAccess
                    ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                {u.autoDispatchAccess ? '🔒 Desativar disparador' : '🔓 Ativar disparador'}
              </button>

              {/* Set daily limit */}
              {u.autoDispatchAccess && (
                <>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={limitInputs[u.id] || ''}
                      onChange={(e) => setLimitInputs((prev) => ({ ...prev, [u.id]: e.target.value }))}
                      placeholder="Novo limite/dia"
                      min={1}
                      className={`${inputClass} flex-1`}
                    />
                    <button
                      onClick={() => handleSetLimit(u.id)}
                      className="bg-purple-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-purple-700 cursor-pointer transition-colors whitespace-nowrap"
                    >
                      Alterar
                    </button>
                  </div>
                  <button
                    onClick={() => handleSetUnlimited(u.id)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-colors bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                  >
                    ♾️ Tornar ilimitado
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
