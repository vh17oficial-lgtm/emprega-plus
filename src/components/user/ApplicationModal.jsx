import { useState, useEffect, useRef } from 'react';
import Portal from '../common/Portal';
import { useAppContext } from '../../context/AppContext';

const defaultSteps = [
  { text: 'Preparando seu currículo...', icon: '📄' },
  { text: 'Anexando arquivo PDF...', icon: '📎' },
  { text: 'Conectando com a empresa...', icon: '🔗' },
  { text: 'Enviando candidatura...', icon: '📤' },
  { text: 'Candidatura enviada com sucesso!', icon: '✅' },
];

export default function ApplicationModal({ isOpen, onClose, job, onComplete }) {
  const { siteConfig } = useAppContext();
  const steps = siteConfig?.applicationSteps?.length ? siteConfig.applicationSteps : defaultSteps;
  const [currentStep, setCurrentStep] = useState(-1);
  const [finished, setFinished] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(-1);
      setFinished(false);
      return;
    }

    document.body.style.overflow = 'hidden';
    setCurrentStep(0);
    setFinished(false);

    let step = 0;
    timerRef.current = setInterval(() => {
      step++;
      if (step >= steps.length) {
        clearInterval(timerRef.current);
        setFinished(true);
        onComplete?.();
      } else {
        setCurrentStep(step);
      }
    }, 900);

    return () => {
      clearInterval(timerRef.current);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !job) return null;

  const progress = finished
    ? 100
    : currentStep >= 0 ? ((currentStep + 1) / steps.length) * 100 : 0;

  return (
    <Portal>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-[appFadeIn_0.2s_ease-out]" />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-[appSlideUp_0.3s_ease-out]">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 text-white">
          <h3 className="text-base font-bold">
            {finished ? (siteConfig?.applicationSuccessTitle || '🎉 Candidatura Enviada!') : '📨 Enviando Candidatura...'}
          </h3>
          <p className="text-xs text-white/80 mt-1">
            {job.title} — {job.company}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-100 h-1.5">
          <div
            className={`h-1.5 transition-all duration-700 ease-out ${
              finished
                ? 'bg-emerald-500'
                : 'bg-gradient-to-r from-indigo-500 to-purple-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Steps */}
        <div className="px-6 py-5">
          <div className="space-y-3 mb-5">
            {steps.map((step, idx) => {
              const isActive = idx === currentStep && !finished;
              const isDone = idx < currentStep || finished;
              const isPending = idx > currentStep && !finished;

              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 transition-all duration-300 ${
                    isPending ? 'opacity-30' : 'opacity-100'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm transition-all duration-300 ${
                    isDone
                      ? 'bg-emerald-100'
                      : isActive
                        ? 'bg-indigo-100 animate-pulse'
                        : 'bg-gray-100'
                  }`}>
                    {isDone ? (
                      <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span>{step.icon}</span>
                    )}
                  </div>
                  <span className={`text-sm transition-all duration-300 ${
                    isDone ? 'text-emerald-700 font-medium' : isActive ? 'text-indigo-700 font-semibold' : 'text-gray-400'
                  }`}>
                    {step.text}
                  </span>
                  {isActive && (
                    <div className="ml-auto flex gap-0.5">
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Finished state */}
          {finished && (
            <div className="text-center pt-4 border-t border-gray-100">
              {/* Animated checkmark */}
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-30" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200 animate-[appBounceIn_0.5s_ease-out]">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <h4 className="text-base font-bold text-gray-900 mb-1">Parabéns! 🎉</h4>
              <p className="text-sm text-gray-600 mb-3">
                Sua candidatura para <span className="font-semibold text-indigo-600">{job.company}</span> foi enviada.
              </p>

              <p className="text-xs text-emerald-600 bg-emerald-50 rounded-lg px-4 py-2.5 mb-4 inline-block font-medium">
                {siteConfig?.applicationSuccessText || '✅ A empresa pode entrar em contato com você em breve. Boa sorte!'}
              </p>
              <br />
              <button
                onClick={onClose}
                className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-all duration-200 cursor-pointer hover:shadow-lg active:scale-95"
              >
                Continuar explorando vagas
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes appFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes appSlideUp { from { opacity: 0; transform: translateY(30px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes appBounceIn { 0% { transform: scale(0); } 60% { transform: scale(1.15); } 100% { transform: scale(1); } }
      `}</style>
    </div>
    </Portal>
  );
}
