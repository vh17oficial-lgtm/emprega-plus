const tabs = [
  { id: 'curriculo', icon: '📝', label: 'Criar Currículo', shortLabel: 'Criar CV', description: 'Monte seu CV profissional' },
  { id: 'upload', icon: '📄', label: 'Enviar Currículo', shortLabel: 'Enviar CV', description: 'Faça upload do seu CV' },
  { id: 'meus', icon: '💼', label: 'Meus Currículos', shortLabel: 'Meus CVs', description: 'Gerencie seus CVs salvos' },
  { id: 'vagas', icon: '🔍', label: 'Explorar Vagas', shortLabel: 'Vagas', description: 'Encontre oportunidades' },
  { id: 'aplicadas', icon: '📮', label: 'Candidaturas', shortLabel: 'Aplicadas', description: 'Acompanhe seus envios' },
  { id: 'disparo', icon: '⚡', label: 'Disparo Automático', shortLabel: 'Disparo', description: 'Envie em massa' },
  { id: 'perfil', icon: '👤', label: 'Minha Conta', shortLabel: 'Conta', description: 'Edite seu perfil' },
];

export default function UserSidebar({ activeTab, onTabChange }) {
  return (
    <aside className="hidden lg:block lg:w-64 shrink-0">
      {/* Desktop only: vertical list with descriptions */}
      <nav className="flex flex-col gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left whitespace-nowrap transition-all duration-200 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <span className="text-lg shrink-0">{tab.icon}</span>
            <div className="min-w-0">
              <p className="text-sm font-medium leading-tight">{tab.label}</p>
              <p className={`text-[10px] leading-tight mt-0.5 ${
                activeTab === tab.id ? 'text-white/70' : 'text-gray-400'
              }`}>{tab.description}</p>
            </div>
          </button>
        ))}
      </nav>
    </aside>
  );
}
