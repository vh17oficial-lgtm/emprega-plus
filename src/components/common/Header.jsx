import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAppContext } from '../../context/AppContext';
import { cacheBust } from '../../utils/cacheBust';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();
  const { siteConfig } = useAppContext();

  const links = [
    { to: '/', label: 'Início' },
    { to: '/usuario?tab=vagas', label: 'Vagas' },
    { to: '/usuario', label: 'Painel' },
  ];

  const isActive = (path) => location.pathname + location.search === path || location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-20 md:h-18">
          {/* Mobile: centered logo with spacing */}
          <div className="flex-1 flex justify-center md:hidden py-3">
            <Link to="/">
              <img src={cacheBust("/logo-certa.png")} alt="Emprega+" className="logo-crisp h-14 w-auto object-contain" />
            </Link>
          </div>

          {/* Desktop: logo left + nav right */}
          <div className="hidden md:flex items-center justify-between w-full">
            <Link to="/" className="flex items-center shrink-0">
              <img src={cacheBust("/logo-certa.png")} alt="Emprega+" className="logo-crisp h-14 w-auto object-contain" />
            </Link>

            <nav className="flex items-center gap-1">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.to)
                        ? 'bg-indigo-50 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {isLoggedIn ? (
                <div className="ml-3 flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100">
                    <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold">{user.nome?.charAt(0)?.toUpperCase()}</span>
                    </div>
                    <span className="text-xs font-medium text-gray-700">{user.nome?.split(' ')[0]}</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-600">
                      {user.sendCredits}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-gray-500 hover:text-red-600 hover:bg-red-50"
                  >
                    Sair
                  </button>
                </div>
              ) : (
                <Link to="/login" className="ml-2">
                  <button className="text-sm font-semibold px-5 py-2 rounded-lg transition-all cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white">
                    Começar grátis
                  </button>
                </Link>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
