import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import EmailDetailModal from './EmailDetailModal';
import PaymentModal from '../common/PaymentModal';

export default function AppliedJobs() {
  const { jobs, appliedJobs, savedResumes, getAppliedJobIds, getApplicationStatus, getClosedMessage, getStatusMessage } = useAppContext();
  const { hasPurchased, isPriorityUser, purchasePriority } = useAuth();
  const appliedIds = getAppliedJobIds();
  const applied = jobs.filter((j) => appliedIds.includes(j.id));
  const [detailJob, setDetailJob] = useState(null);
  const [showPriorityPayment, setShowPriorityPayment] = useState(false);

  const getAppliedDate = (jobId) => {
    const entry = appliedJobs.find((a) => (typeof a === 'object' ? a.jobId : a) === jobId);
    if (entry && entry.appliedAt) {
      return new Date(entry.appliedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    return null;
  };

  const getResumeForJob = (jobId) => {
    const entry = appliedJobs.find((a) => (typeof a === 'object' ? a.jobId : a) === jobId);
    if (entry?.resumeId) {
      const found = savedResumes.find((r) => r.id === entry.resumeId);
      if (found) return found;
    }
    return savedResumes.find((r) => r.type !== 'upload') || savedResumes[savedResumes.length - 1] || null;
  };

  const priorityPlan = {
    id: 'priority-resume',
    name: 'Currículo com Prioridade',
    description: 'Destaque seu currículo nas empresas',
    credits: 1,
    price: 9.99,
    popular: true,
  };

  if (applied.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">📮</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma candidatura ainda</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Acesse a aba "Explorar Vagas" e envie seu currículo para começar a se candidatar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Priority badge or upsell */}
      {isPriorityUser() ? (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl">🔥</span>
          <div>
            <p className="text-sm font-bold text-amber-800">Currículo em destaque</p>
            <p className="text-xs text-amber-600">Seu currículo tem prioridade na visualização pelas empresas.</p>
          </div>
        </div>
      ) : hasPurchased() ? (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🚀</span>
              <div>
                <p className="text-sm font-bold text-gray-900">Destaque seu currículo</p>
                <p className="text-xs text-gray-600 mt-0.5">
                  Seu currículo terá prioridade na visualização pelas empresas, aumentando suas chances de ser chamado.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPriorityPayment(true)}
              className="shrink-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold px-5 py-2.5 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 cursor-pointer hover:shadow-lg"
            >
              ⭐ Ativar destaque — R$ 9,99
            </button>
          </div>
        </div>
      ) : null}

      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-2.5">
        <span className="text-lg">🍀</span>
        <p className="text-sm text-blue-700 font-medium">As empresas podem entrar em contato com você em breve. Boa sorte!</p>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{applied.length} candidatura(s)</p>
        <div className="flex gap-2 flex-wrap">
          {(() => {
            const counts = { enviada: 0, em_analise: 0, pre_selecionado: 0, encerrada: 0 };
            applied.forEach(j => { const s = getApplicationStatus(j.id) || 'enviada'; counts[s] = (counts[s] || 0) + 1; });
            return <>
              {counts.enviada > 0 && <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full">{counts.enviada} enviada(s)</span>}
              {counts.em_analise > 0 && <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">{counts.em_analise} em análise</span>}
              {counts.pre_selecionado > 0 && <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">{counts.pre_selecionado} pré-selec.</span>}
              {counts.encerrada > 0 && <span className="bg-gray-200 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">{counts.encerrada} encerrada(s)</span>}
            </>;
          })()}
        </div>
      </div>

      {applied.map((job) => {
        const appStatus = getApplicationStatus(job.id);
        const statusConfig = {
          enviada: { label: 'Enviado', bgClass: 'bg-emerald-50 text-emerald-700', dotClass: 'bg-emerald-500', dot: true },
          em_analise: { label: 'Em análise', bgClass: 'bg-blue-50 text-blue-700', dotClass: 'bg-blue-500', dot: true },
          pre_selecionado: { label: 'Pré-selecionado', bgClass: 'bg-green-50 text-green-700 border border-green-200', dotClass: 'bg-green-500', dot: true, icon: '🎯' },
          encerrada: { label: 'Encerrada', bgClass: 'bg-gray-100 text-gray-500', dotClass: '', dot: false, icon: '❌' },
        }[appStatus || 'enviada'];

        return (
        <div key={job.id} className={`bg-white border rounded-xl p-5 ${
          appStatus === 'encerrada' ? 'border-gray-200 bg-gray-50/40 opacity-75' : 'border-gray-200'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                appStatus === 'encerrada' ? 'bg-gray-100' : appStatus === 'pre_selecionado' ? 'bg-green-50' : appStatus === 'em_analise' ? 'bg-blue-50' : 'bg-emerald-50'
              }`}>
                <span className={`font-bold text-sm ${
                  appStatus === 'encerrada' ? 'text-gray-500' : appStatus === 'pre_selecionado' ? 'text-green-600' : appStatus === 'em_analise' ? 'text-blue-600' : 'text-emerald-600'
                }`}>{job.company.charAt(0)}</span>
              </div>
              <div className="min-w-0">
                <h4 className="font-medium text-gray-900 truncate">{job.title}</h4>
                <p className="text-sm text-gray-500">{job.company} • {job.location}</p>
                {getAppliedDate(job.id) && (
                  <p className="text-xs text-gray-400 mt-0.5">📅 Enviado em {getAppliedDate(job.id)}</p>
                )}
                {appStatus === 'encerrada' && (
                  <p className="text-xs text-gray-500 mt-1 italic">{getClosedMessage(job.id)}</p>
                )}
                {appStatus === 'pre_selecionado' && (
                  <p className="text-xs text-green-600 mt-1 font-medium">{getStatusMessage('pre_selecionado')}</p>
                )}
                {appStatus === 'em_analise' && (
                  <p className="text-xs text-blue-600 mt-1">{getStatusMessage('em_analise')}</p>
                )}
                {appStatus === 'enviada' && (
                  <p className="text-xs text-emerald-600 mt-1">{getStatusMessage('enviada')}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setDetailJob(job)}
                className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-medium px-3.5 py-2 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer border border-indigo-200"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Detalhes
              </button>
              <span className={`inline-flex items-center gap-1.5 ${statusConfig.bgClass} text-xs font-medium px-3 py-2 rounded-lg`}>
                {statusConfig.dot && <span className={`w-2 h-2 ${statusConfig.dotClass} rounded-full animate-pulse`} />}
                {!statusConfig.dot && <span>{statusConfig.icon}</span>}
                {statusConfig.label}
              </span>
            </div>
          </div>
        </div>
        );
      })}

      <EmailDetailModal
        isOpen={!!detailJob}
        onClose={() => setDetailJob(null)}
        job={detailJob}
        resume={detailJob ? getResumeForJob(detailJob.id) : null}
        appliedAt={detailJob ? (appliedJobs.find(a => (typeof a === 'object' ? a.jobId : a) === detailJob.id))?.appliedAt : null}
      />

      <PaymentModal
        isOpen={showPriorityPayment}
        onClose={() => setShowPriorityPayment(false)}
        plan={priorityPlan}
        onComplete={() => {
          purchasePriority();
          setShowPriorityPayment(false);
        }}
      />
    </div>
  );
}
