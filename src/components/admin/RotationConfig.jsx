import { useAppContext } from '../../context/AppContext';

export default function RotationConfig() {
  const { rotationConfig, updateRotationConfig, manualRotation, jobs, appliedJobs } = useAppContext();

  const activeCount = jobs.filter(j => j.status !== 'encerrada').length;
  const closedCount = jobs.filter(j => j.status === 'encerrada').length;
  const closedApps = appliedJobs.filter(a => {
    if (typeof a !== 'object') return false;
    return a.status === 'encerrada';
  }).length;

  const lastRotation = (() => {
    try {
      const d = localStorage.getItem('emprega_last_rotation');
      return d ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Nunca';
    } catch { return 'Nunca'; }
  })();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">🔁 Rotação de Vagas</h3>
          <p className="text-sm text-gray-500 mt-0.5">Sistema automático de renovação de vagas</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
          <p className="text-2xl font-bold text-emerald-700">{activeCount}</p>
          <p className="text-xs text-emerald-600 mt-1">Vagas ativas</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <p className="text-2xl font-bold text-gray-600">{closedCount}</p>
          <p className="text-xs text-gray-500 mt-1">Vagas encerradas</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <p className="text-2xl font-bold text-blue-700">{appliedJobs.length}</p>
          <p className="text-xs text-blue-600 mt-1">Total candidaturas</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
          <p className="text-2xl font-bold text-amber-700">{closedApps}</p>
          <p className="text-xs text-amber-600 mt-1">Candidaturas encerradas</p>
        </div>
      </div>

      {/* Config */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-5">
        {/* Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">Rotação automática</p>
            <p className="text-xs text-gray-500 mt-0.5">Encerra e gera novas vagas automaticamente</p>
          </div>
          <button
            onClick={async () => await updateRotationConfig({ enabled: !rotationConfig.enabled })}
            className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${
              rotationConfig.enabled ? 'bg-emerald-500' : 'bg-gray-300'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              rotationConfig.enabled ? 'translate-x-6' : ''
            }`} />
          </button>
        </div>

        {/* Interval */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Intervalo: <span className="text-indigo-600 font-bold">{rotationConfig.intervalDays} dias</span>
          </label>
          <input
            type="range"
            min={1}
            max={14}
            value={rotationConfig.intervalDays}
            onChange={async (e) => await updateRotationConfig({ intervalDays: Number(e.target.value) })}
            className="w-full accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1 dia</span>
            <span>7 dias</span>
            <span>14 dias</span>
          </div>
        </div>

        {/* Count */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Vagas por rotação: <span className="text-indigo-600 font-bold">{rotationConfig.rotateCount}</span>
          </label>
          <input
            type="range"
            min={10}
            max={100}
            step={5}
            value={rotationConfig.rotateCount}
            onChange={async (e) => await updateRotationConfig({ rotateCount: Number(e.target.value) })}
            className="w-full accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>10</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>

        {/* Last rotation info */}
        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500">Última rotação: <span className="font-medium text-gray-700">{lastRotation}</span></p>
        </div>

        {/* Manual rotation */}
        <button
          onClick={async () => {
            if (window.confirm(`Isso vai encerrar ${rotationConfig.rotateCount} vagas e gerar ${rotationConfig.rotateCount} novas. Continuar?`)) {
              await manualRotation();
            }
          }}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all cursor-pointer hover:shadow-lg"
        >
          🔄 Executar rotação manualmente
        </button>
      </div>
    </div>
  );
}
