const sections = [
  { id: 'vagas', label: '📋 Gestão de Vagas' },
  { id: 'gerador', label: '🔄 Gerar Vagas' },
  { id: 'landing', label: '🎨 Landing Page' },
  { id: 'empresas', label: '🏢 Empresas' },
  { id: 'depoimentos', label: '⭐ Depoimentos' },
  { id: 'videos', label: '🎥 Vídeos' },
  { id: 'config', label: '⚙️ Configurações' },
  { id: 'planos', label: '💰 Planos de Envio' },
  { id: 'disparador', label: '🤖 Disparador' },
  { id: 'textos', label: '✏️ Textos de Upsell' },
  { id: 'provasocial', label: '🔔 Prova Social' },
  { id: 'rotacao', label: '🔁 Rotação de Vagas' },
  { id: 'candidaturas', label: '📊 Candidaturas' },
  { id: 'usuarios', label: '👥 Usuários' },
  { id: 'tickets', label: '💬 Chat Suporte' },
];

export default function AdminSidebar({ activeSection, onSectionChange }) {
  return (
    <aside className="w-full lg:w-64 shrink-0">
      {/* Mobile: 2-col grid */}
      <nav className="grid grid-cols-2 gap-2 lg:hidden">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeSection === section.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {section.label}
          </button>
        ))}
      </nav>
      {/* Desktop: vertical list */}
      <nav className="hidden lg:flex lg:flex-col gap-1">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeSection === section.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {section.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
