import { useEffect } from 'react';
import Portal from './Portal';

export default function UpsellModal({ isOpen, onClose, title, subtitle, plans, onSelectPlan, icon = '🔒' }) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen || !plans?.length) return null;

  const activePlans = plans.filter((p) => p.active !== false);
  const gridCols =
    activePlans.length === 1 ? '' :
    activePlans.length <= 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4';

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-[scaleIn_0.25s_ease-out]">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 px-6 sm:px-8 py-5 sm:py-6 text-white relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white/60 hover:text-white transition-colors cursor-pointer z-10">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="text-3xl mb-2">{icon}</div>
          <h2 className="text-lg sm:text-xl font-bold pr-8">{title}</h2>
          <p className="text-xs sm:text-sm text-white/80 mt-1">{subtitle}</p>
        </div>

        {/* Plans grid — scrollable */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto overscroll-contain">
          <div className={`grid grid-cols-1 ${gridCols} gap-4 ${activePlans.length === 1 ? 'max-w-xs mx-auto' : ''}`}>
            {activePlans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => onSelectPlan(plan)}
                className={`relative border-2 rounded-2xl p-5 text-center transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer group ${
                  plan.popular
                    ? 'border-indigo-500 bg-indigo-50/50 hover:bg-indigo-50 shadow-md shadow-indigo-100'
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
                    ⭐ Mais popular
                  </span>
                )}

                {plan.credits && (
                  <p className="text-3xl font-extrabold text-gray-900 mb-0.5">{plan.credits}</p>
                )}
                <p className="text-sm font-medium text-gray-700">{plan.name}</p>
                {plan.description && (
                  <p className="text-xs text-gray-500 mt-1">{plan.description}</p>
                )}

                <div className="mt-4 mb-1">
                  <span className="text-xs text-gray-400">R$</span>
                  <span className="text-2xl font-extrabold text-indigo-600 ml-0.5">
                    {plan.price.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                {plan.credits && plan.credits > 1 && (
                  <p className="text-[10px] text-gray-400 mb-3">
                    R$ {(plan.price / plan.credits).toFixed(2).replace('.', ',')} por envio
                  </p>
                )}

                <div className={`py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                  plan.popular
                    ? 'bg-indigo-600 text-white group-hover:bg-indigo-700 shadow-sm'
                    : 'bg-gray-100 text-gray-700 group-hover:bg-indigo-600 group-hover:text-white'
                }`}>
                  Aumentar minhas chances
                </div>
              </button>
            ))}
          </div>

          <div className="flex flex-col items-center gap-2 mt-5">
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">🔒 Pagamento seguro via Pix</span>
              <span className="flex items-center gap-1">⚡ Créditos liberados na hora</span>
            </div>
            <p className="text-[10px] text-gray-300">
              Mais de 2.800 pessoas já compraram créditos na plataforma
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
    </Portal>
  );
}
