import { useAppContext } from '../../context/AppContext';

const BANNER_TYPES = [
  { value: 'info', label: 'ℹ️ Informação', bg: 'bg-blue-600', text: 'text-white' },
  { value: 'warning', label: '⚠️ Aviso', bg: 'bg-amber-500', text: 'text-white' },
  { value: 'success', label: '✅ Sucesso', bg: 'bg-emerald-600', text: 'text-white' },
  { value: 'promo', label: '🔥 Promoção', bg: 'bg-gradient-to-r from-purple-600 to-indigo-600', text: 'text-white' },
];

export default function BannerManager() {
  const { siteConfig, updateSiteConfig } = useAppContext();
  const banner = siteConfig.banner || { enabled: false, text: '', type: 'info', dismissible: true };

  const update = (key, value) => {
    updateSiteConfig({ banner: { ...banner, [key]: value } });
  };

  const preview = BANNER_TYPES.find(t => t.value === banner.type) || BANNER_TYPES[0];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">📢 Banner / Anúncios</h3>
        <p className="text-sm text-gray-500 mt-1">Exiba um aviso no topo do site para todos os visitantes.</p>
      </div>

      {/* Toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200">
        <div>
          <p className="text-sm font-semibold text-gray-800">Banner ativo</p>
          <p className="text-xs text-gray-500">Exibir banner no topo do site</p>
        </div>
        <button
          onClick={() => update('enabled', !banner.enabled)}
          className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${banner.enabled ? 'bg-indigo-600' : 'bg-gray-300'}`}
        >
          <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${banner.enabled ? 'translate-x-6' : ''}`} />
        </button>
      </div>

      {/* Text */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Texto do banner</label>
        <input
          value={banner.text}
          onChange={(e) => update('text', e.target.value)}
          placeholder="Ex: 🚀 Promoção especial! 50% de desconto nos créditos de envio."
          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        />
      </div>

      {/* Type */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Estilo</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {BANNER_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => update('type', t.value)}
              className={`px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all border ${
                banner.type === t.value
                  ? 'border-indigo-500 ring-2 ring-indigo-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dismissible toggle */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={banner.dismissible}
          onChange={(e) => update('dismissible', e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-indigo-600 cursor-pointer"
        />
        <label className="text-sm text-gray-700">Permitir que o usuário feche o banner</label>
      </div>

      {/* Preview */}
      {banner.text && (
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-2">Pré-visualização</p>
          <div className={`${preview.bg} ${preview.text} px-4 py-2.5 text-sm font-medium text-center rounded-lg`}>
            {banner.text}
          </div>
        </div>
      )}
    </div>
  );
}
