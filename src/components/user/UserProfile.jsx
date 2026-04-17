import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
];

function FeedbackMsg({ type, text }) {
  if (!text) return null;
  const colors = type === 'success'
    ? 'bg-green-50 border-green-200 text-green-700'
    : 'bg-red-50 border-red-200 text-red-700';
  return (
    <div className={`px-4 py-2.5 rounded-xl border text-sm ${colors}`}>
      {text}
    </div>
  );
}

export default function UserProfile() {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const navigate = useNavigate();
  const photoRef = useRef(null);

  const [nome, setNome] = useState(user?.nome || '');
  const [telefone, setTelefone] = useState(user?.telefone || '');
  const [cidade, setCidade] = useState(user?.cidade || '');
  const [estado, setEstado] = useState(user?.estado || '');
  const [fotoPerfil, setFotoPerfil] = useState(user?.fotoPerfil || null);

  const [profileMsg, setProfileMsg] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [senhaMsg, setSenhaMsg] = useState(null);
  const [savingSenha, setSavingSenha] = useState(false);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setProfileMsg({ type: 'error', text: 'Imagem muito grande. Máximo 2MB.' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setFotoPerfil(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg(null);
    if (!nome.trim()) {
      setProfileMsg({ type: 'error', text: 'O nome é obrigatório.' });
      return;
    }
    setSavingProfile(true);
    try {
      const result = await updateProfile({ nome: nome.trim(), telefone, cidade, estado, fotoPerfil });
      setProfileMsg(result.success
        ? { type: 'success', text: 'Dados salvos com sucesso!' }
        : { type: 'error', text: result.error });
      if (result.success) setTimeout(() => setProfileMsg(null), 3000);
    } catch {
      setProfileMsg({ type: 'error', text: 'Erro ao salvar. Tente novamente.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSenhaMsg(null);
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      setSenhaMsg({ type: 'error', text: 'Preencha todos os campos.' });
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setSenhaMsg({ type: 'error', text: 'As senhas não conferem.' });
      return;
    }
    if (novaSenha.length < 6) {
      setSenhaMsg({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres.' });
      return;
    }
    setSavingSenha(true);
    try {
      const result = await changePassword(senhaAtual, novaSenha);
      if (result.success) {
        setSenhaMsg({ type: 'success', text: 'Senha alterada com sucesso!' });
        setSenhaAtual('');
        setNovaSenha('');
        setConfirmarSenha('');
        setTimeout(() => setSenhaMsg(null), 3000);
      } else {
        setSenhaMsg({ type: 'error', text: result.error });
      }
    } catch {
      setSenhaMsg({ type: 'error', text: 'Erro ao alterar senha. Tente novamente.' });
    } finally {
      setSavingSenha(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow bg-white';

  return (
    <div className="space-y-8">
      {/* ── Foto + Dados ── */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Foto de perfil */}
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div
            onClick={() => photoRef.current?.click()}
            className="relative w-24 h-24 rounded-full border-2 border-dashed border-gray-300 hover:border-indigo-400 cursor-pointer overflow-hidden bg-gray-50 flex items-center justify-center transition-colors group shrink-0"
          >
            {fotoPerfil ? (
              <img src={fotoPerfil} alt="Foto" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center">
                <svg className="w-8 h-8 mx-auto text-gray-400 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                </svg>
              </div>
            )}
            <input ref={photoRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
          </div>

          <div className="text-center sm:text-left">
            <p className="font-medium text-gray-800">{user?.nome}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <div className="flex gap-2 mt-2 justify-center sm:justify-start">
              <button type="button" onClick={() => photoRef.current?.click()} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer">
                {fotoPerfil ? 'Alterar foto' : 'Adicionar foto'}
              </button>
              {fotoPerfil && (
                <button type="button" onClick={() => setFotoPerfil(null)} className="text-xs text-red-500 hover:text-red-700 font-medium cursor-pointer">
                  Remover
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome completo *</label>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} className={inputClass} placeholder="Seu nome completo" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
            <input type="email" value={user?.email || ''} disabled className={`${inputClass} bg-gray-100 text-gray-500 cursor-not-allowed`} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefone</label>
            <input type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} className={inputClass} placeholder="(00) 00000-0000" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Cidade</label>
              <input type="text" value={cidade} onChange={(e) => setCidade(e.target.value)} className={inputClass} placeholder="Sua cidade" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Estado</label>
              <select value={estado} onChange={(e) => setEstado(e.target.value)} className={inputClass}>
                <option value="">UF</option>
                {ESTADOS_BR.map((uf) => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <FeedbackMsg type={profileMsg?.type} text={profileMsg?.text} />

        <button
          type="submit"
          disabled={savingProfile}
          className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-60 cursor-pointer"
        >
          {savingProfile ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </form>

      {/* ── Separador ── */}
      <hr className="border-gray-200" />

      {/* ── Alterar Senha ── */}
      <form onSubmit={handleChangePassword} className="space-y-4">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          🔐 Alterar senha
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Senha atual</label>
            <input type="password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} className={inputClass} placeholder="••••••" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nova senha</label>
            <input type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} className={inputClass} placeholder="••••••" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar nova senha</label>
            <input type="password" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} className={inputClass} placeholder="••••••" />
          </div>
        </div>

        <FeedbackMsg type={senhaMsg?.type} text={senhaMsg?.text} />

        <button
          type="submit"
          disabled={savingSenha}
          className="w-full sm:w-auto px-6 py-3 bg-gray-800 text-white text-sm font-semibold rounded-xl hover:bg-gray-900 transition-colors disabled:opacity-60 cursor-pointer"
        >
          {savingSenha ? 'Alterando...' : 'Alterar senha'}
        </button>
      </form>

      {/* ── Separador ── */}
      <hr className="border-gray-200" />

      {/* ── Sair da Conta ── */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          🚪 Sair da conta
        </h3>
        <p className="text-sm text-gray-500">
          Ao sair, você será redirecionado para a tela de login. Seus dados ficarão salvos.
        </p>

        {!showLogoutConfirm ? (
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="px-6 py-3 border-2 border-red-200 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
          >
            Sair da conta
          </button>
        ) : (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-700 flex-1">Tem certeza que deseja sair?</p>
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
            >
              Sim, sair
            </button>
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(false)}
              className="px-4 py-2 bg-white text-gray-600 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
