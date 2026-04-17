import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import AdminSidebar from '../components/admin/AdminSidebar';
import { cacheBust } from '../utils/cacheBust';
import JobManager from '../components/admin/JobManager';
import JobGenerator from '../components/admin/JobGenerator';
import LandingEditor from '../components/admin/LandingEditor';
import PlansManager from '../components/admin/PlansManager';
import DispatcherConfig from '../components/admin/DispatcherConfig';
import UpsellTextsEditor from '../components/admin/UpsellTextsEditor';
import SiteConfigEditor from '../components/admin/SiteConfigEditor';
import SocialProofManager from '../components/admin/SocialProofManager';
import CompanyManager from '../components/admin/CompanyManager';
import TestimonialManager from '../components/admin/TestimonialManager';
import VideoManager from '../components/admin/VideoManager';
import RotationConfig from '../components/admin/RotationConfig';
import ApplicationManager from '../components/admin/ApplicationManager';
import UserManager from '../components/admin/UserManager';
import TicketManager from '../components/admin/TicketManager';

const ADMIN_EMAIL = 'admin@emprega.com';
const ADMIN_PASSWORD = 'admin123';

function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !senha.trim()) {
      setError('Preencha todos os campos.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      if (email.trim().toLowerCase() === ADMIN_EMAIL && senha.trim() === ADMIN_PASSWORD) {
        onLogin();
      } else {
        setError('Credenciais inválidas.');
      }
      setLoading(false);
    }, 500);
  };

  const inputClass = 'w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 bg-white outline-none transition-all focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]';

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2">
            <img src={cacheBust("/logo-certa.png")} alt="Emprega+" className="logo-crisp h-16 w-auto object-contain" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🔒</span>
            <h2 className="text-xl font-bold text-gray-900">Área Administrativa</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Acesso restrito. Insira as credenciais de administrador.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 mb-4">
            <p className="text-xs text-slate-500 font-medium mb-1">Credenciais de acesso:</p>
            <p className="text-xs text-slate-700 font-mono">admin@emprega.com / admin123</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email do admin</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@emprega.com" className={inputClass} autoComplete="username" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Senha</label>
              <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="••••••••" className={inputClass} autoComplete="current-password" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verificando...
                </span>
              ) : (
                'Entrar no painel'
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-6">
          <Link to="/" className="text-sm text-slate-400 hover:text-white transition-colors">
            ← Voltar para a página inicial
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [activeSection, setActiveSection] = useState('vagas');

  if (!authenticated) {
    return <AdminLogin onLogin={() => setAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Painel Administrativo</h1>
            <p className="text-sm text-gray-500 mt-1">Gerencie vagas, planos, disparador e personalize a plataforma.</p>
          </div>
          <button
            onClick={() => setAuthenticated(false)}
            className="text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors cursor-pointer self-start"
          >
            🔒 Sair do admin
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">
          <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />

          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 md:p-8">
              {activeSection === 'vagas' && <JobManager />}
              {activeSection === 'gerador' && <JobGenerator />}
              {activeSection === 'landing' && <LandingEditor />}
              {activeSection === 'empresas' && <CompanyManager />}
              {activeSection === 'depoimentos' && <TestimonialManager />}
              {activeSection === 'videos' && <VideoManager />}
              {activeSection === 'config' && <SiteConfigEditor />}
              {activeSection === 'planos' && <PlansManager />}
              {activeSection === 'disparador' && <DispatcherConfig />}
              {activeSection === 'textos' && <UpsellTextsEditor />}
              {activeSection === 'provasocial' && <SocialProofManager />}
              {activeSection === 'rotacao' && <RotationConfig />}
              {activeSection === 'candidaturas' && <ApplicationManager />}
              {activeSection === 'usuarios' && <UserManager />}
              {activeSection === 'tickets' && <TicketManager />}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
