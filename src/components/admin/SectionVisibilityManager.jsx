import { useAppContext } from '../../context/AppContext';

const SECTIONS = [
  { key: 'hero', label: 'Hero / Topo', description: 'Título principal e pré-visualização do currículo' },
  { key: 'features', label: 'Funcionalidades', description: 'Seção de benefícios e features' },
  { key: 'howItWorks', label: 'Como Funciona', description: 'Passo a passo' },
  { key: 'testimonials', label: 'Depoimentos', description: 'Avaliações dos usuários' },
  { key: 'videos', label: 'Vídeos', description: 'Galeria de vídeos' },
  { key: 'partners', label: 'Parceiros', description: 'Logos de empresas parceiras' },
  { key: 'cta', label: 'Chamada para Ação', description: 'Botão de cadastro final' },
  { key: 'reviews', label: 'Avaliações do Site', description: 'Seção de avaliações decorativa' },
];

export default function SectionVisibilityManager() {
  const { siteConfig, updateSiteConfig } = useAppContext();
  const sections = siteConfig.sections || {};

  const toggle = (key) => {
    const current = sections[key] !== false; // default true
    updateSiteConfig({ sections: { ...sections, [key]: !current } });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">🎛️ Seções da Landing Page</h3>
        <p className="text-sm text-gray-500 mt-1">Controle a visibilidade de cada seção da página inicial.</p>
      </div>

      <div className="space-y-2">
        {SECTIONS.map((s) => {
          const visible = sections[s.key] !== false;
          return (
            <div
              key={s.key}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
            >
              <div>
                <p className="text-sm font-medium text-gray-800">{s.label}</p>
                <p className="text-xs text-gray-500">{s.description}</p>
              </div>
              <button
                onClick={() => toggle(s.key)}
                className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${visible ? 'bg-indigo-600' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${visible ? 'translate-x-5' : ''}`} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
