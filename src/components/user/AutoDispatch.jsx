import { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import UpsellModal from '../common/UpsellModal';
import PaymentModal from '../common/PaymentModal';
import DispatchFilters from './DispatchFilters';

const dispatchOptions = [10, 20, 30, 40, 50, 100];

const templateLabels = {
  classico: 'Clássico',
  profissional: 'Profissional',
  executivo: 'Executivo',
  upload: 'Upload',
};

export default function AutoDispatch() {
  const { getUnappliedJobs, bulkApply, savedResumes, autoDispatchConfig, upsellTexts, jobs } = useAppContext();
  const {
    hasAutoDispatchAccess,
    getDailyDispatchRemaining,
    consumeDailyDispatch,
    refreshProfile,
    user,
  } = useAuth();

  const [dispatching, setDispatching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [result, setResult] = useState(null);
  const [currentCompany, setCurrentCompany] = useState('');

  // Filters
  const [filters, setFilters] = useState({ category: '', workType: '', level: '', location: '' });

  // Resume selection
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const selectedResume = savedResumes.find(r => r.id === selectedResumeId) || savedResumes[0] || null;

  // Upsell states
  const [showPurchaseUpsell, setShowPurchaseUpsell] = useState(false);
  const [showUpgradeUpsell, setShowUpgradeUpsell] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [purchaseType, setPurchaseType] = useState(null);

  const unapplied = getUnappliedJobs();
  const hasResume = savedResumes.length > 0;
  const dispatchAccess = hasAutoDispatchAccess();
  const dailyRemaining = getDailyDispatchRemaining();
  const dailyLimit = user?.dailyDispatchUnlimited ? Infinity : (user?.dailyDispatchLimit || 0);

  // Filter unapplied jobs
  const filteredUnapplied = useMemo(() => {
    return unapplied.filter((job) => {
      if (filters.category && job.category !== filters.category) return false;
      if (filters.workType && job.workType !== filters.workType) return false;
      if (filters.level && job.level !== filters.level) return false;
      if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
      return true;
    });
  }, [unapplied, filters]);

  const filterFn = (job) => {
    if (filters.category && job.category !== filters.category) return false;
    if (filters.workType && job.workType !== filters.workType) return false;
    if (filters.level && job.level !== filters.level) return false;
    if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
    return true;
  };

  const handleDispatch = (count) => {
    if (!hasResume || !dispatchAccess) return;

    const maxByLimit = dailyRemaining === Infinity ? count : dailyRemaining;
    if (maxByLimit <= 0) {
      setShowUpgradeUpsell(true);
      return;
    }

    const actualCount = Math.min(count, filteredUnapplied.length, maxByLimit);
    if (actualCount === 0) return;

    setDispatching(true);
    setProgress(0);
    setTotal(actualCount);
    setResult(null);
    setCurrentCompany('');

    const companies = filteredUnapplied.slice(0, actualCount);
    let current = 0;
    const interval = setInterval(async () => {
      setCurrentCompany(companies[current]?.company || '');
      current++;
      setProgress(current);
      if (current >= actualCount) {
        clearInterval(interval);
        consumeDailyDispatch(actualCount);
        const applied = await bulkApply(actualCount, filterFn);
        setDispatching(false);
        setResult(applied);
        setCurrentCompany('');
      }
    }, 200);
  };

  // Purchase flow
  const basePlan = {
    id: 'dispatch-base',
    name: 'Disparador Automático',
    description: `${autoDispatchConfig.initialDailyLimit} disparos por dia`,
    credits: autoDispatchConfig.initialDailyLimit,
    price: autoDispatchConfig.basePrice,
    popular: true,
  };

  const upgradePlans = autoDispatchConfig.upgrades.map((u) => ({
    id: u.id,
    name: u.label,
    credits: u.amount === -1 ? undefined : u.amount,
    description: u.amount === -1 ? 'Sem limites diários' : `+${u.amount} disparos ao limite diário`,
    price: u.price,
    popular: u.amount === -1,
    _amount: u.amount,
    _label: u.label,
  }));

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setShowPurchaseUpsell(false);
    setShowUpgradeUpsell(false);
    setPurchaseType(showPurchaseUpsell ? 'base' : 'upgrade');
  };

  const handlePaymentComplete = () => {
    refreshProfile();
    setSelectedPlan(null);
    setPurchaseType(null);
  };

  // Daily progress
  const dailyUsed = user?.dailyDispatchUsed || 0;
  const dailyProgressPercent = dailyLimit === Infinity
    ? 0
    : dailyLimit > 0 ? ((dailyUsed / dailyLimit) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <h3 className="text-base sm:text-lg font-semibold">⚡ Disparo Automático</h3>
          <span className={`backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium self-start ${
            dispatchAccess
              ? dailyRemaining === 0 ? 'bg-amber-400/30 text-amber-100' : 'bg-white/20'
              : 'bg-red-500/30'
          }`}>
            {!dispatchAccess ? '🔒 Bloqueado' : dailyRemaining === 0 ? '⏰ Limite atingido' : '✅ Disponível'}
          </span>
        </div>

        <div className={`grid grid-cols-2 ${dispatchAccess ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-2 sm:gap-3`}>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold">{filteredUnapplied.length}</p>
            <p className="text-[10px] sm:text-xs text-white/70 mt-1">Vagas compatíveis</p>
          </div>
          {dispatchAccess && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center">
              <p className="text-2xl sm:text-3xl font-bold">{dailyRemaining === Infinity ? '∞' : dailyRemaining}</p>
              <p className="text-[10px] sm:text-xs text-white/70 mt-1">Disparos restantes</p>
            </div>
          )}
          <div className={`bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center ${!dispatchAccess ? '' : 'col-span-2 sm:col-span-1'}`}>
            <p className="text-2xl sm:text-3xl font-bold">{dailyUsed}</p>
            <p className="text-[10px] sm:text-xs text-white/70 mt-1">Enviados hoje</p>
          </div>
        </div>

        {/* Daily progress bar */}
        {dispatchAccess && dailyLimit !== Infinity && dailyLimit > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-white/60">Progresso diário</span>
              <span className="text-xs text-white/80 font-semibold">{dailyUsed} / {dailyLimit}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  dailyProgressPercent >= 90 ? 'bg-red-400' : dailyProgressPercent >= 70 ? 'bg-amber-400' : 'bg-white'
                }`}
                style={{ width: `${Math.min(dailyProgressPercent, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Not purchased — purchase CTA */}
      {!dispatchAccess && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-6 text-center">
          <div className="text-4xl mb-3">🚀</div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">{upsellTexts.dispatchLockedTitle}</h3>
          <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">{upsellTexts.dispatchLockedText}</p>
          <div className="bg-white rounded-xl p-4 max-w-xs mx-auto mb-4 border border-purple-100">
            <p className="text-sm text-gray-500">A partir de</p>
            <p className="text-3xl font-extrabold text-indigo-600">
              R$ {autoDispatchConfig.basePrice.toFixed(2).replace('.', ',')}
            </p>
            <p className="text-xs text-gray-400 mt-1">{autoDispatchConfig.initialDailyLimit} disparos por dia</p>
          </div>
          <button
            onClick={() => setShowPurchaseUpsell(true)}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all duration-200 cursor-pointer hover:shadow-lg"
          >
            🔓 Desbloquear agora
          </button>
        </div>
      )}

      {/* No resume warning */}
      {!hasResume && dispatchAccess && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-xl shrink-0">⚠️</span>
          <div>
            <p className="text-sm font-medium text-amber-800">Currículo necessário</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Você precisa ter pelo menos um currículo salvo para usar o disparo automático.
            </p>
          </div>
        </div>
      )}

      {/* Dispatch Filters */}
      {dispatchAccess && hasResume && (
        <DispatchFilters
          filters={filters}
          onChange={setFilters}
          matchCount={filteredUnapplied.length}
        />
      )}

      {/* Resume selector for dispatch */}
      {dispatchAccess && hasResume && savedResumes.length > 1 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <label className="block text-sm font-semibold text-gray-900 mb-2">📄 Currículo selecionado para disparo</label>
          <select
            value={selectedResumeId || savedResumes[0]?.id || ''}
            onChange={(e) => setSelectedResumeId(Number(e.target.value))}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none cursor-pointer bg-white"
          >
            {savedResumes.map((resume) => {
              const isUpload = resume.type === 'upload' || resume.template === 'upload';
              const name = isUpload
                ? (resume.fileName || 'Currículo enviado')
                : (resume.nome || resume.cargo || 'Currículo criado');
              const tpl = templateLabels[resume.template] || 'Clássico';
              return (
                <option key={resume.id} value={resume.id}>
                  {name} — {isUpload ? `Arquivo (${resume.fileSize || 'PDF'})` : `Modelo ${tpl}`} — {resume.savedAt || ''}
                </option>
              );
            })}
          </select>
          {selectedResume && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-gray-500">Selecionado:</span>
              <span className="text-xs font-medium text-indigo-600">
                {(selectedResume.type === 'upload' || selectedResume.template === 'upload')
                  ? (selectedResume.fileName || 'Currículo enviado')
                  : (selectedResume.nome || selectedResume.cargo || 'Currículo criado')}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Single resume indicator */}
      {dispatchAccess && hasResume && savedResumes.length === 1 && (
        <div className="flex items-center gap-2 px-1">
          <span className="text-xs text-gray-500">📄 Currículo:</span>
          <span className="text-xs font-medium text-indigo-600">
            {(savedResumes[0].type === 'upload' || savedResumes[0].template === 'upload')
              ? (savedResumes[0].fileName || 'Currículo enviado')
              : (savedResumes[0].nome || savedResumes[0].cargo || 'Currículo criado')}
          </span>
        </div>
      )}

      {/* Daily limit exhausted */}
      {dispatchAccess && dailyRemaining === 0 && !dispatching && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 text-center">
          <div className="text-3xl mb-2">⏰</div>
          <h4 className="font-bold text-gray-900 mb-1">{upsellTexts.dispatchLimitTitle}</h4>
          <p className="text-sm text-gray-600 mb-3">{upsellTexts.dispatchLimitText}</p>
          <button
            onClick={() => setShowUpgradeUpsell(true)}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all duration-200 cursor-pointer"
          >
            ⬆️ Aumentar meu limite
          </button>
        </div>
      )}

      {/* Dispatch Options */}
      {dispatchAccess && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Selecione a quantidade de disparos</h3>
          <p className="text-xs text-gray-500 mb-4">
            Seu currículo será enviado automaticamente para as vagas filtradas
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {dispatchOptions.map((count) => {
              const maxByLimit = dailyRemaining === Infinity ? count : Math.min(count, dailyRemaining);
              const available = Math.min(maxByLimit, filteredUnapplied.length);
              const disabled = dispatching || filteredUnapplied.length === 0 || !hasResume || dailyRemaining === 0;
              return (
                <button
                  key={count}
                  onClick={() => handleDispatch(count)}
                  disabled={disabled}
                  className={`relative p-4 rounded-xl border-2 text-center transition-all duration-200 cursor-pointer ${
                    disabled
                      ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                      : 'border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-md hover:-translate-y-0.5 active:scale-95'
                  }`}
                >
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-xs text-gray-500 mt-1">disparos</p>
                  {available < count && filteredUnapplied.length > 0 && (
                    <p className="text-[10px] text-amber-600 mt-1 font-medium">({available} disponíveis)</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Progress */}
      {dispatching && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-indigo-900">⚡ Disparando currículos...</p>
            <span className="text-sm font-bold text-indigo-600">{progress}/{total}</span>
          </div>
          <div className="w-full bg-indigo-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-200"
              style={{ width: `${(progress / total) * 100}%` }}
            />
          </div>
          {currentCompany && (
            <p className="text-xs text-indigo-600 mt-2 animate-pulse">
              📤 Enviando para <span className="font-semibold">{currentCompany}</span>...
            </p>
          )}
        </div>
      )}

      {/* Result */}
      {result !== null && !dispatching && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
          <div className="relative w-14 h-14 mx-auto mb-3">
            <div className="absolute inset-0 bg-emerald-200 rounded-full animate-ping opacity-30" />
            <div className="relative w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-bold text-emerald-800 mb-1">Disparo concluído! 🎉</h3>
          <p className="text-sm text-emerald-600">
            <span className="font-bold text-emerald-700">{result}</span> currículo(s) enviado(s) com sucesso.
          </p>
          <p className="text-xs text-emerald-500 mt-2">
            Acompanhe suas candidaturas na aba "Candidaturas".
          </p>
        </div>
      )}

      {dispatchAccess && filteredUnapplied.length === 0 && !dispatching && result === null && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <div className="text-3xl mb-2">📭</div>
          <p className="text-sm text-amber-700 font-medium">
            {unapplied.length === 0
              ? 'Você já se candidatou a todas as vagas disponíveis!'
              : 'Nenhuma vaga encontrada com os filtros selecionados.'
            }
          </p>
          <p className="text-xs text-amber-600 mt-1">
            {unapplied.length === 0
              ? 'Aguarde novas vagas serem publicadas.'
              : 'Tente ajustar os filtros para ver mais vagas.'
            }
          </p>
        </div>
      )}

      {/* Purchase dispatcher upsell */}
      <UpsellModal
        isOpen={showPurchaseUpsell}
        onClose={() => setShowPurchaseUpsell(false)}
        title={upsellTexts.dispatchLockedTitle}
        subtitle={upsellTexts.dispatchLockedText}
        icon="🚀"
        plans={[basePlan]}
        onSelectPlan={handleSelectPlan}
      />

      {/* Upgrade daily limit upsell */}
      <UpsellModal
        isOpen={showUpgradeUpsell}
        onClose={() => setShowUpgradeUpsell(false)}
        title={upsellTexts.dispatchLimitTitle}
        subtitle={upsellTexts.dispatchLimitText}
        icon="⬆️"
        plans={upgradePlans}
        onSelectPlan={handleSelectPlan}
      />

      {/* Payment modal */}
      <PaymentModal
        isOpen={!!selectedPlan}
        onClose={() => { setSelectedPlan(null); setPurchaseType(null); }}
        plan={selectedPlan}
        productType={purchaseType === 'base' ? 'auto_dispatch' : 'daily_limit_upgrade'}
        productId={selectedPlan?.id || 'dispatch-base'}
        onComplete={handlePaymentComplete}
      />
    </div>
  );
}
