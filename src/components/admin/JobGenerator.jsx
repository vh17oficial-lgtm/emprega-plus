import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';

export default function JobGenerator() {
  const { jobs, regenerateAllJobs } = useAppContext();
  const [quantity, setQuantity] = useState(500);
  const [status, setStatus] = useState(null); // null | 'confirming' | 'generating' | 'done'
  const [result, setResult] = useState(null);

  const levelStats = (list) => {
    const s = { 'Sem experiência': 0, 'Júnior': 0, 'Pleno': 0, 'Sênior': 0 };
    list.forEach(j => { if (s[j.level] !== undefined) s[j.level]++; });
    return s;
  };

  const workTypeStats = (list) => {
    const s = { 'Home Office': 0, 'Presencial': 0, 'Híbrido': 0 };
    list.forEach(j => { if (s[j.workType] !== undefined) s[j.workType]++; });
    return s;
  };

  const stats = levelStats(jobs);
  const wtStats = workTypeStats(jobs);

  const handleGenerate = () => {
    if (quantity < 10 || quantity > 2000) return;
    setStatus('confirming');
  };

  const confirmGenerate = () => {
    setStatus('generating');
    setResult(null);
    // Small delay so the UI shows loading state
    setTimeout(() => {
      const count = regenerateAllJobs(quantity);
      setResult(count);
      setStatus('done');
    }, 800);
  };

  const reset = () => {
    setStatus(null);
    setResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Current stats */}
      <div className="bg-gradient-to-r from-slate-50 to-indigo-50 rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
          📊 Vagas Atuais
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {Object.entries(stats).map(([level, count]) => (
            <div key={level} className="bg-white rounded-lg p-3 border border-slate-100 text-center">
              <p className="text-xl font-bold text-indigo-600">{count}</p>
              <p className="text-xs text-slate-500 mt-0.5">{level}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          {Object.entries(wtStats).map(([type, count]) => (
            <span key={type} className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600">
              {type}: <strong className="text-slate-800">{count}</strong>
            </span>
          ))}
          <span className="bg-indigo-100 border border-indigo-200 rounded-lg px-3 py-1.5 text-xs font-bold text-indigo-700">
            Total: {jobs.length}
          </span>
        </div>
      </div>

      {/* Generator controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          🔄 Gerar Novas Vagas
        </h3>

        {status === null && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Quantidade de vagas
              </label>
              <input
                type="number"
                min={10}
                max={2000}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(10, Math.min(2000, parseInt(e.target.value) || 10)))}
                className="w-full sm:w-48 px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">Mínimo: 10 • Máximo: 2.000</p>
            </div>

            {/* Proportion preview */}
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-500 mb-2">Distribuição estimada:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <span className="text-gray-600">Sem exp: <strong>{Math.round(quantity * 0.6)}</strong></span>
                <span className="text-gray-600">Júnior: <strong>{Math.round(quantity * 0.2)}</strong></span>
                <span className="text-gray-600">Pleno: <strong>{Math.round(quantity * 0.14)}</strong></span>
                <span className="text-gray-600">Sênior: <strong>{Math.max(1, quantity - Math.round(quantity * 0.6) - Math.round(quantity * 0.2) - Math.round(quantity * 0.14))}</strong></span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                <span className="text-gray-600">Home Office: <strong>~{Math.round(quantity * 0.7)}</strong></span>
                <span className="text-gray-600">Presencial/Híbrido: <strong>~{Math.round(quantity * 0.3)}</strong></span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleGenerate}
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors cursor-pointer flex items-center gap-2"
              >
                🔄 Gerar {quantity} vagas
              </button>
              <button
                onClick={() => setQuantity(500)}
                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2.5 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                Restaurar padrão (500)
              </button>
            </div>
          </div>
        )}

        {/* Confirmation */}
        {status === 'confirming' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="text-sm font-bold text-amber-800">Confirmar regeneração</p>
                <p className="text-sm text-amber-700 mt-1">
                  Isso irá <strong>apagar todas as {jobs.length} vagas atuais</strong> e gerar {quantity} novas vagas.
                  Candidaturas dos usuários que referenciam vagas antigas podem ficar inconsistentes.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={confirmGenerate}
                className="bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-amber-700 transition-colors cursor-pointer"
              >
                Confirmar e gerar
              </button>
              <button
                onClick={reset}
                className="text-sm text-gray-600 hover:text-gray-800 px-4 py-2.5 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {status === 'generating' && (
          <div className="flex flex-col items-center py-8">
            <svg className="animate-spin h-10 w-10 text-indigo-600 mb-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm font-medium text-gray-700">Gerando {quantity} vagas realistas...</p>
            <p className="text-xs text-gray-400 mt-1">Criando empresas, salários, descrições e badges</p>
          </div>
        )}

        {/* Success */}
        {status === 'done' && result !== null && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-3xl">✅</span>
              <div>
                <p className="text-sm font-bold text-emerald-800">{result} vagas geradas com sucesso!</p>
                <p className="text-sm text-emerald-600 mt-1">
                  Todas as vagas foram substituídas por novas vagas realistas com empresas, salários e descrições variadas.
                </p>
              </div>
            </div>
            <button
              onClick={reset}
              className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
