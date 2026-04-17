import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppContext } from '../../context/AppContext';
import UpsellModal from '../common/UpsellModal';
import PaymentModal from '../common/PaymentModal';

export default function CreditsBar() {
  const { user, addSendCredits, hasAutoDispatchAccess, getDailyDispatchRemaining } = useAuth();
  const { sendPlans, upsellTexts, getAppliedCount } = useAppContext();
  const [showUpsell, setShowUpsell] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  if (!user) return null;

  const dailyRemaining = getDailyDispatchRemaining();
  const dispatchAccess = hasAutoDispatchAccess();
  const appliedCount = getAppliedCount();
  const isLowCredits = user.sendCredits > 0 && user.sendCredits <= 2;
  const isZeroCredits = user.sendCredits === 0;

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setShowUpsell(false);
  };

  const handlePaymentComplete = (plan) => {
    addSendCredits(plan.credits, plan.name, plan.price);
    setSelectedPlan(null);
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Olá, {user.nome}! 👋</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {appliedCount > 0
                ? <>Você já enviou <span className="font-semibold text-indigo-600">{appliedCount}</span> currículo(s). Continue se candidatando!</>
                : 'Comece criando seu currículo e se candidate às melhores vagas.'
              }
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Send credits badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
              isZeroCredits
                ? 'bg-red-50 border-red-200'
                : isLowCredits
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-indigo-50 border-indigo-100'
            }`}>
              <span className="text-xs">📨</span>
              <span className={`text-sm font-semibold ${
                isZeroCredits ? 'text-red-700' : isLowCredits ? 'text-amber-700' : 'text-indigo-700'
              }`}>
                {user.sendCredits} envio(s)
              </span>
              {isZeroCredits && (
                <span className="text-[10px] text-red-600 font-medium ml-1">❌ esgotado</span>
              )}
              {isLowCredits && !isZeroCredits && (
                <span className="text-[10px] text-amber-600 font-medium ml-1">⚠️ baixo</span>
              )}
            </div>

            {/* Daily dispatch badge */}
            {dispatchAccess && (
              <div className="flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100">
                <span className="text-xs">⚡</span>
                <span className="text-sm text-purple-700 font-semibold">
                  {dailyRemaining === Infinity ? '∞' : dailyRemaining} disparo(s)
                </span>
              </div>
            )}

            <button
              onClick={() => setShowUpsell(true)}
              className={`text-xs font-semibold cursor-pointer transition-all px-3 py-1.5 rounded-lg border ${
                isZeroCredits || isLowCredits
                  ? 'text-white bg-indigo-600 border-indigo-600 hover:bg-indigo-700 shadow-sm animate-pulse'
                  : 'text-indigo-600 bg-indigo-50 border-indigo-100 hover:text-indigo-800 hover:bg-indigo-100'
              }`}
            >
              🚀 {isZeroCredits ? 'Comprar envios' : 'Aumentar chances'}
            </button>
          </div>
        </div>

        {/* Applied progress + credits bar */}
        {(appliedCount > 0 || user.sendCredits <= 5) && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
            {/* Applied count progress */}
            {appliedCount > 0 && (
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-500 flex items-center gap-1">📊 Candidaturas enviadas</span>
                  <span className="text-xs font-bold text-indigo-600">{appliedCount}</span>
                </div>
                <div className="w-full bg-indigo-50 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-1.5 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 transition-all duration-700"
                    style={{ width: `${Math.min((appliedCount / Math.max(appliedCount + 5, 10)) * 100, 95)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Credits remaining */}
            {user.sendCredits > 0 && user.sendCredits <= 5 && (
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-500">Créditos restantes</span>
                  <span className={`text-xs font-bold ${isLowCredits ? 'text-amber-600' : 'text-indigo-600'}`}>{user.sendCredits}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      isLowCredits ? 'bg-amber-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${Math.min((user.sendCredits / 10) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <UpsellModal
        isOpen={showUpsell}
        onClose={() => setShowUpsell(false)}
        title="🚀 Aumente suas chances!"
        subtitle="Escolha um pacote e continue se candidatando às melhores vagas."
        icon="📨"
        plans={sendPlans}
        onSelectPlan={handleSelectPlan}
      />

      <PaymentModal
        isOpen={!!selectedPlan}
        onClose={() => setSelectedPlan(null)}
        plan={selectedPlan}
        onComplete={handlePaymentComplete}
      />
    </>
  );
}
