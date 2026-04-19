import { useAppContext } from '../../context/AppContext';

export default function MaintenanceManager() {
  const { siteConfig, updateSiteConfig } = useAppContext();
  const maint = siteConfig.maintenance || { enabled: false, title: 'Em manutenção', message: '' };

  const update = (key, value) => {
    updateSiteConfig({ maintenance: { ...maint, [key]: value } });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">🔧 Modo Manutenção</h3>
        <p className="text-sm text-gray-500 mt-1">Quando ativado, visitantes veem uma página de manutenção. Admins continuam acessando normalmente.</p>
      </div>

      {/* Toggle */}
      <div className={`flex items-center justify-between p-4 rounded-xl border ${maint.enabled ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
        <div>
          <p className={`text-sm font-semibold ${maint.enabled ? 'text-red-700' : 'text-gray-800'}`}>
            {maint.enabled ? '⚠️ Manutenção ATIVA' : 'Manutenção desativada'}
          </p>
          <p className="text-xs text-gray-500">
            {maint.enabled ? 'O site está offline para visitantes' : 'O site está funcionando normalmente'}
          </p>
        </div>
        <button
          onClick={() => update('enabled', !maint.enabled)}
          className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${maint.enabled ? 'bg-red-500' : 'bg-gray-300'}`}
        >
          <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${maint.enabled ? 'translate-x-6' : ''}`} />
        </button>
      </div>

      {/* Customize message */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Título</label>
        <input
          value={maint.title}
          onChange={(e) => update('title', e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Mensagem</label>
        <textarea
          value={maint.message}
          onChange={(e) => update('message', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
        />
      </div>

      {/* Preview */}
      {maint.enabled && (
        <div className="border border-red-200 rounded-xl p-6 bg-red-50 text-center">
          <p className="text-xs font-semibold text-red-400 mb-2">Pré-visualização (o que o visitante verá)</p>
          <div className="text-4xl mb-3">🔧</div>
          <h2 className="text-xl font-bold text-gray-900">{maint.title || 'Em manutenção'}</h2>
          <p className="text-sm text-gray-600 mt-2">{maint.message || 'Voltamos em breve!'}</p>
        </div>
      )}
    </div>
  );
}
