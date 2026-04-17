import { useState } from 'react';
import { Home, Search, Send, Zap, MoreHorizontal, FileText, Upload, FolderOpen, User, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const mainItems = [
  { id: 'home', icon: Home, label: 'Início', route: '/' },
  { id: 'vagas', icon: Search, label: 'Vagas', tab: 'vagas', route: '/usuario?tab=vagas' },
  { id: 'aplicadas', icon: Send, label: 'Candidaturas', tab: 'aplicadas', route: '/usuario?tab=aplicadas' },
  { id: 'disparo', icon: Zap, label: 'Disparo', tab: 'disparo', route: '/usuario?tab=disparo' },
];

const moreItems = [
  { id: 'curriculo', icon: FileText, label: 'Criar Currículo', tab: 'curriculo', route: '/usuario' },
  { id: 'upload', icon: Upload, label: 'Enviar Currículo', tab: 'upload', route: '/usuario?tab=upload' },
  { id: 'meus', icon: FolderOpen, label: 'Meus Currículos', tab: 'meus', route: '/usuario?tab=meus' },
  { id: 'perfil', icon: User, label: 'Minha Conta', tab: 'perfil', route: '/usuario?tab=perfil' },
];

export default function MobileBottomNav({ activeTab, onTabChange }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isOnDashboard = location.pathname === '/usuario';

  const isMoreActive = moreItems.some((item) =>
    isOnDashboard && activeTab ? activeTab === item.tab : false
  );

  const getIsActive = (item) => {
    if (item.id === 'home') return location.pathname === '/';
    if (isOnDashboard && activeTab) return activeTab === item.tab;
    return location.pathname + location.search === item.route;
  };

  const handleClick = (item) => {
    setMoreOpen(false);
    if (item.id === 'home') {
      navigate('/');
      return;
    }
    if (isOnDashboard && onTabChange) {
      onTabChange(item.tab);
    } else {
      navigate(item.route);
    }
  };

  return (
    <>
      {/* "Mais" overlay panel */}
      {moreOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setMoreOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute bottom-[60px] left-0 right-0 bg-white rounded-t-2xl shadow-2xl p-4 pb-2"
            style={{ paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-sm font-semibold text-gray-800">Mais opções</span>
              <button onClick={() => setMoreOpen(false)} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = getIsActive(item);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleClick(item)}
                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-600 hover:bg-gray-50 active:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[11px] font-medium leading-tight text-center">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[hsl(215,25%,15%)] shadow-[0_-4px_20px_rgba(0,0,0,0.15)] lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="flex items-stretch" style={{ height: '60px' }}>
          {mainItems.map((item) => {
            const Icon = item.icon;
            const isActive = getIsActive(item);

            return (
              <button
                key={item.id}
                onClick={() => handleClick(item)}
                className={`relative flex flex-col items-center justify-center gap-1 flex-1 transition-colors cursor-pointer ${
                  isActive ? 'text-white' : 'text-gray-500 active:text-gray-400'
                }`}
              >
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[3px] bg-indigo-500 rounded-b-full" />
                )}
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
                <span className={`text-[10px] leading-none ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* "Mais" button */}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className={`relative flex flex-col items-center justify-center gap-1 flex-1 transition-colors cursor-pointer ${
              moreOpen || isMoreActive ? 'text-white' : 'text-gray-500 active:text-gray-400'
            }`}
          >
            {isMoreActive && !moreOpen && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[3px] bg-indigo-500 rounded-b-full" />
            )}
            <MoreHorizontal className={`w-5 h-5 ${moreOpen || isMoreActive ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
            <span className={`text-[10px] leading-none ${moreOpen || isMoreActive ? 'font-bold' : 'font-medium'}`}>
              Mais
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
