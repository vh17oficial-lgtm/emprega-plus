import { useEffect, useMemo } from 'react';
import { buildJobDetails } from '../../utils/jobDetailsBuilder';
import { cacheBust } from '../../utils/cacheBust';
import Portal from '../common/Portal';

const workTypeIcons = { 'Presencial': '🏢', 'Home Office': '🏠', 'Híbrido': '🔄' };

function Section({ icon, title, children }) {
  return (
    <section className="mb-5">
      <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2">
        <span>{icon}</span>
        <span>{title}</span>
      </h3>
      <div className="text-sm text-gray-700 leading-relaxed">{children}</div>
    </section>
  );
}

function Bullets({ items }) {
  return (
    <ul className="space-y-1.5">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2">
          <span className="text-indigo-500 mt-0.5 shrink-0">•</span>
          <span className="break-words">{it}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Reusable inner content of the detail panel — same content used in desktop side panel and mobile bottom sheet.
 */
function JobDetailContent({ job, applicantsToday }) {
  const details = useMemo(() => buildJobDetails(job), [job]);
  if (!details) return null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        {job.logo ? (
          <img
            src={cacheBust(job.logo)}
            alt={job.company}
            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-gray-100"
            onError={(e) => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        <div
          className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center shrink-0"
          style={job.logo ? { display: 'none' } : {}}
        >
          {job.company?.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-snug break-words">{job.title}</h2>
          <p className="text-sm text-indigo-600 font-medium truncate">{job.company}</p>
          <p className="text-xs text-gray-500 mt-0.5 truncate">📍 {job.location}</p>
        </div>
      </div>

      {/* Quick badges */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {job.workType && (
          <span className="text-[11px] font-medium px-2 py-1 rounded-md border bg-emerald-50 text-emerald-700 border-emerald-200">
            {workTypeIcons[job.workType] || ''} {job.workType}
          </span>
        )}
        {job.level && (
          <span className="text-[11px] font-medium px-2 py-1 rounded-md border bg-sky-50 text-sky-700 border-sky-200">
            ⭐ {job.level}
          </span>
        )}
        {details.tags.map((t, i) => (
          <span key={i} className="text-[11px] font-medium px-2 py-1 rounded-md border bg-indigo-50 text-indigo-700 border-indigo-200">
            ✓ {t}
          </span>
        ))}
        {details.highDemand && (
          <span className="text-[11px] font-semibold px-2 py-1 rounded-md border bg-rose-50 text-rose-700 border-rose-200">
            🔥 Alta procura
          </span>
        )}
      </div>

      {/* Salary box */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-3 mb-4">
        <p className="text-[11px] text-emerald-700 font-medium uppercase tracking-wide">Remuneração</p>
        <p className="text-lg font-bold text-emerald-700">💰 {job.salary || 'A combinar'}</p>
        {job.cargaHoraria && <p className="text-xs text-gray-600 mt-0.5">🕐 {job.cargaHoraria}</p>}
      </div>

      {/* Social proof */}
      <div className="flex flex-wrap items-center gap-2 mb-5 text-[11px]">
        <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 font-medium px-2.5 py-1 rounded-md border border-indigo-200">
          ⚡ {applicantsToday} pessoas se candidataram hoje
        </span>
      </div>

      {/* Sections */}
      <Section icon="📌" title="Sobre a empresa">
        <p>{details.sobreEmpresa}</p>
      </Section>

      <Section icon="📄" title="Descrição da vaga">
        <p>{details.descricao}</p>
      </Section>

      <Section icon="🛠️" title="Principais atividades">
        <Bullets items={details.atividades} />
      </Section>

      <Section icon="🎯" title="Requisitos">
        <Bullets items={details.requisitos} />
      </Section>

      <Section icon="💰" title="Remuneração e benefícios">
        <Bullets items={details.beneficios} />
      </Section>

      <Section icon="📈" title="Crescimento profissional">
        <p>{details.crescimento}</p>
      </Section>

      <Section icon="⏱️" title="Jornada de trabalho">
        <ul className="space-y-1.5">
          <li><strong>Carga horária:</strong> {details.jornada.horas}</li>
          <li><strong>Horário:</strong> {details.jornada.turno}</li>
          <li><strong>Dias:</strong> {details.jornada.dias}</li>
        </ul>
      </Section>

      <Section icon="⚠️" title="Informações adicionais">
        <ul className="space-y-1.5">
          <li><strong>Tipo de contrato:</strong> {details.infoAdicionais.tipoContrato}</li>
          <li><strong>Início:</strong> {details.infoAdicionais.inicio}</li>
          <li><strong>Vagas disponíveis:</strong> {details.infoAdicionais.numVagas}</li>
          <li><strong>Como funciona:</strong> {details.infoAdicionais.processo}</li>
        </ul>
      </Section>

      <p className="text-[11px] text-gray-400 leading-relaxed mt-4 border-t border-gray-100 pt-3">
        ℹ️ As informações apresentadas refletem o padrão da vaga publicada. Detalhes específicos (ex.: dias de folga, plano de saúde) são confirmados pela empresa durante o processo seletivo.
      </p>
    </div>
  );
}

function ApplyButton({ job, onApply, applied, isClosed, hasResume }) {
  if (isClosed) {
    return (
      <button disabled className="w-full bg-gray-100 text-gray-500 font-semibold py-3 rounded-xl cursor-not-allowed">
        Vaga encerrada
      </button>
    );
  }
  if (applied) {
    return (
      <button disabled className="w-full bg-emerald-100 text-emerald-700 font-semibold py-3 rounded-xl cursor-not-allowed">
        ✓ Candidatura enviada
      </button>
    );
  }
  if (!hasResume) {
    return (
      <button
        onClick={() => onApply(job)}
        className="w-full bg-amber-50 text-amber-700 font-semibold py-3 rounded-xl border border-amber-200 hover:bg-amber-100 transition-all cursor-pointer"
      >
        📋 Crie um currículo para se candidatar
      </button>
    );
  }
  return (
    <button
      onClick={() => onApply(job)}
      className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all active:scale-[0.98] cursor-pointer"
    >
      🚀 CANDIDATAR-SE
    </button>
  );
}

/**
 * Desktop right-side sticky panel.
 */
export function JobDetailPanelDesktop({ job, onApply, applied, isClosed, hasResume }) {
  if (!job) {
    return (
      <div className="hidden lg:flex sticky top-4 h-[calc(100vh-2rem)] bg-white border border-gray-200 rounded-2xl items-center justify-center">
        <div className="text-center px-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-indigo-50 flex items-center justify-center text-2xl">👈</div>
          <p className="text-sm font-semibold text-gray-700">Selecione uma vaga</p>
          <p className="text-xs text-gray-500 mt-1">Clique em qualquer vaga da lista para ver os detalhes completos aqui.</p>
        </div>
      </div>
    );
  }
  const applicantsToday = buildJobDetails(job).applicantsToday;
  return (
    <div className="hidden lg:flex sticky top-4 h-[calc(100vh-2rem)] bg-white border border-gray-200 rounded-2xl flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-5">
        <JobDetailContent job={job} applicantsToday={applicantsToday} />
      </div>
      <div className="border-t border-gray-100 p-4 bg-white">
        <ApplyButton job={job} onApply={onApply} applied={applied} isClosed={isClosed} hasResume={hasResume} />
      </div>
    </div>
  );
}

/**
 * Mobile bottom sheet (slides up from bottom). Stays full content + sticky apply CTA.
 */
export function JobDetailSheetMobile({ job, isOpen, onClose, onApply, applied, isClosed, hasResume }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  if (!isOpen || !job) return null;
  const applicantsToday = buildJobDetails(job).applicantsToday;

  return (
    <Portal>
    <div className="lg:hidden fixed inset-0 z-[60] flex flex-col">
      <div
        className="absolute inset-0 bg-black/50 animate-[jdpFade_0.2s_ease-out]"
        onClick={onClose}
      />
      <div className="relative mt-auto bg-white rounded-t-3xl shadow-2xl flex flex-col max-h-[92vh] animate-[jdpSlide_0.28s_ease-out]">
        {/* drag indicator + close */}
        <div className="flex items-center justify-between px-4 pt-3 pb-1 shrink-0">
          <span className="block w-12 h-1.5 rounded-full bg-gray-300 mx-auto" />
          <button
            onClick={onClose}
            className="absolute right-3 top-3 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 cursor-pointer"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pt-2 pb-4">
          <JobDetailContent job={job} applicantsToday={applicantsToday} />
        </div>

        <div className="border-t border-gray-100 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-white shrink-0">
          <ApplyButton job={job} onApply={onApply} applied={applied} isClosed={isClosed} hasResume={hasResume} />
        </div>
      </div>

      <style>{`
        @keyframes jdpFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes jdpSlide { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </div>
    </Portal>
  );
}
