import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export default function OnboardingChecklist({ onNavigate }) {
  const { savedResumes, getAppliedCount, hasVisitedVagas, siteConfig } = useAppContext();
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !user) return null;

  const steps = siteConfig.onboardingSteps || [];
  const hasResume = savedResumes.length > 0;
  const hasApplied = getAppliedCount() > 0;

  const completed = [hasResume, hasVisitedVagas, hasApplied];
  const completedCount = completed.filter(Boolean).length;
  const allDone = completedCount === steps.length;
  const progress = steps.length > 0 ? (completedCount / steps.length) * 100 : 0;

  if (allDone) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-50 via-white to-purple-50 border border-indigo-100 rounded-2xl p-5 mb-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100/40 rounded-full -translate-y-1/2 translate-x-1/2" />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              {siteConfig.onboardingTitle}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">{siteConfig.onboardingSubtitle}</p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1"
            title="Dispensar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-bold text-indigo-600 whitespace-nowrap">{completedCount}/{steps.length}</span>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {steps.map((step, idx) => {
            const done = completed[idx];
            return (
              <button
                key={step.id}
                onClick={() => !done && onNavigate?.(step.tab)}
                className={`flex items-start gap-3 p-3 rounded-xl text-left transition-all cursor-pointer ${
                  done
                    ? 'bg-emerald-50 border border-emerald-200'
                    : 'bg-white border border-gray-200 hover:border-indigo-300 hover:shadow-sm'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm ${
                  done ? 'bg-emerald-100' : 'bg-indigo-50'
                }`}>
                  {done ? '✅' : step.icon}
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-semibold ${done ? 'text-emerald-700 line-through' : 'text-gray-900'}`}>
                    {step.label}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{step.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
