import { useState, useMemo, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import CardVaga from './CardVaga';
import JobFilters from './JobFilters';
import ApplicationModal from './ApplicationModal';
import ResumeSelectorModal from './ResumeSelectorModal';
import Modal from '../common/Modal';
import UpsellModal from '../common/UpsellModal';
import PaymentModal from '../common/PaymentModal';

const emptyFilters = { search: '', category: '', workType: '', level: '', location: '' };

export default function JobList() {
  const { jobs, applyToJob, isJobApplied, savedResumes, sendPlans, upsellTexts, getNewJobsToday, getActivityCount, getActiveJobs, getJobViews, getJobApplications } = useAppContext();
  const { hasSendCredits, consumeSendCredit, addSendCredits } = useAuth();
  const [appModalOpen, setAppModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [noResumeWarning, setNoResumeWarning] = useState(false);
  const [filters, setFilters] = useState({ ...emptyFilters });
  const [page, setPage] = useState(1);
  const JOBS_PER_PAGE = 20;

  // Upsell flow
  const [showUpsell, setShowUpsell] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [pendingJob, setPendingJob] = useState(null);

  // Resume selector
  const [showResumeSelector, setShowResumeSelector] = useState(false);
  const [pendingResumeJob, setPendingResumeJob] = useState(null);
  const [selectedResumeId, setSelectedResumeId] = useState(null);

  const hasResume = savedResumes.length > 0;

  const activeJobs = useMemo(() => jobs.filter(j => j.status !== 'encerrada'), [jobs]);

  const filteredJobs = useMemo(() => {
    return activeJobs.filter((job) => {
      if (filters.search) {
        const s = filters.search.toLowerCase();
        if (!job.title.toLowerCase().includes(s) && !job.company.toLowerCase().includes(s)) return false;
      }
      if (filters.category && job.category !== filters.category) return false;
      if (filters.workType && job.workType !== filters.workType) return false;
      if (filters.level && job.level !== filters.level) return false;
      if (filters.location) {
        if (!job.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
      }
      return true;
    });
  }, [activeJobs, filters]);

  const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
  const paginatedJobs = useMemo(() => {
    const start = (page - 1) * JOBS_PER_PAGE;
    return filteredJobs.slice(start, start + JOBS_PER_PAGE);
  }, [filteredJobs, page]);

  // Reset page when filters change
  const prevFiltersRef = useRef(filters);
  if (prevFiltersRef.current !== filters) {
    prevFiltersRef.current = filters;
    if (page !== 1) setPage(1);
  }

  const startApplication = (job, resumeId) => {
    consumeSendCredit();
    setSelectedJob(job);
    setSelectedResumeId(resumeId || (savedResumes.length === 1 ? savedResumes[0].id : null));
    setAppModalOpen(true);
  };

  const handleApply = (job) => {
    if (!hasResume) {
      setNoResumeWarning(true);
      return;
    }
    if (!hasSendCredits()) {
      setPendingJob(job);
      setShowUpsell(true);
      return;
    }
    // If multiple resumes, let user choose
    if (savedResumes.length > 1) {
      setPendingResumeJob(job);
      setShowResumeSelector(true);
      return;
    }
    startApplication(job);
  };

  const handleResumeSelected = (resume) => {
    setShowResumeSelector(false);
    if (pendingResumeJob) {
      startApplication(pendingResumeJob, resume?.id);
      setPendingResumeJob(null);
    }
  };

  const handleApplicationComplete = async () => {
    if (selectedJob) await applyToJob(selectedJob.id, selectedResumeId);
  };

  const handleCloseAppModal = () => {
    setAppModalOpen(false);
    setSelectedJob(null);
    setSelectedResumeId(null);
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setShowUpsell(false);
  };

  const handlePaymentComplete = (plan) => {
    addSendCredits(plan.credits, plan.name, plan.price);
    setSelectedPlan(null);
    if (pendingJob) {
      setTimeout(() => {
        // If multiple resumes, ask for selection after payment too
        if (savedResumes.length > 1) {
          setPendingResumeJob(pendingJob);
          setPendingJob(null);
          setShowResumeSelector(true);
        } else {
          startApplication(pendingJob);
          setPendingJob(null);
        }
      }, 300);
    }
  };

  return (
    <div>
      {!hasResume && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-5 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <span className="text-lg">📋</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-800">Crie seu currículo primeiro</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Para se candidatar às vagas, você precisa ter pelo menos um currículo salvo. Use a aba "Criar Currículo" ou "Enviar Currículo".
            </p>
          </div>
        </div>
      )}

      {/* Activity banners */}
      <div className="flex flex-wrap gap-3 mb-4">
        {getNewJobsToday() > 0 && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-2 rounded-lg border border-emerald-200">
            <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            +{getNewJobsToday()} novas vagas adicionadas hoje
          </div>
        )}
        <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-2 rounded-lg border border-indigo-200">
          <span className="inline-block w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
          +{getActivityCount()} pessoas se candidataram hoje
        </div>
      </div>

      <JobFilters
        filters={filters}
        onChange={setFilters}
        resultCount={filteredJobs.length}
        totalCount={activeJobs.length}
      />

      {filteredJobs.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-3xl">🔍</span>
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">Nenhuma vaga encontrada</h3>
          <p className="text-sm text-gray-500 mb-4">Tente ajustar os filtros para ver mais resultados.</p>
          <button
            onClick={() => setFilters({ ...emptyFilters })}
            className="text-sm text-indigo-600 font-medium hover:text-indigo-800 cursor-pointer transition-colors"
          >
            🔄 Limpar filtros
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 min-w-0 w-full">
            {paginatedJobs.map((job) => (
              <CardVaga key={job.id} job={job} onApply={handleApply} applied={isJobApplied(job.id)} hasResume={hasResume} jobViews={getJobViews(job.id)} jobApplications={getJobApplications(job.id)} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                ← Anterior
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 sm:w-9 sm:h-9 text-xs sm:text-sm font-medium rounded-lg cursor-pointer transition-colors ${
                        page === pageNum
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Próxima →
              </button>
            </div>
          )}
        </>
      )}

      {/* Resume selector modal */}
      <ResumeSelectorModal
        isOpen={showResumeSelector}
        onClose={() => { setShowResumeSelector(false); setPendingResumeJob(null); }}
        resumes={savedResumes}
        onSelect={handleResumeSelected}
        jobTitle={pendingResumeJob?.title}
      />

      {/* Application process modal */}
      <ApplicationModal
        isOpen={appModalOpen}
        onClose={handleCloseAppModal}
        job={selectedJob}
        onComplete={handleApplicationComplete}
      />

      {/* No resume warning */}
      <Modal isOpen={noResumeWarning} onClose={() => setNoResumeWarning(false)} title="Currículo necessário">
        <div className="text-center py-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-3xl">📋</span>
          </div>
          <h4 className="text-base font-bold text-gray-900 mb-2">Você precisa de um currículo</h4>
          <p className="text-sm text-gray-600 mb-1">
            Para se candidatar, é necessário ter pelo menos um currículo salvo.
          </p>
          <p className="text-xs text-gray-400 mb-6">
            Crie um na aba "Criar Currículo" ou envie o seu na aba "Enviar Currículo".
          </p>
          <button
            onClick={() => setNoResumeWarning(false)}
            className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-all duration-200 cursor-pointer active:scale-95"
          >
            Entendi, vou criar agora
          </button>
        </div>
      </Modal>

      {/* Send credits upsell */}
      <UpsellModal
        isOpen={showUpsell}
        onClose={() => { setShowUpsell(false); setPendingJob(null); }}
        title="🚀 Você já usou seu envio gratuito!"
        subtitle="Continue se candidatando e aumente suas chances de conseguir um emprego."
        icon="📨"
        plans={sendPlans}
        onSelectPlan={handleSelectPlan}
      />

      {/* Payment modal */}
      <PaymentModal
        isOpen={!!selectedPlan}
        onClose={() => { setSelectedPlan(null); setPendingJob(null); }}
        plan={selectedPlan}
        onComplete={handlePaymentComplete}
      />
    </div>
  );
}
