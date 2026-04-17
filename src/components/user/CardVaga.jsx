import { cacheBust } from '../../utils/cacheBust';

const workTypeColors = {
  'Presencial': 'bg-blue-50 text-blue-700 border-blue-200',
  'Home Office': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Híbrido': 'bg-purple-50 text-purple-700 border-purple-200',
};

const workTypeIcons = {
  'Presencial': '🏢',
  'Home Office': '🏠',
  'Híbrido': '🔄',
};

const levelColors = {
  'Sem experiência': 'bg-gray-50 text-gray-600 border-gray-200',
  'Júnior': 'bg-sky-50 text-sky-700 border-sky-200',
  'Pleno': 'bg-amber-50 text-amber-700 border-amber-200',
  'Sênior': 'bg-rose-50 text-rose-700 border-rose-200',
};

function getUrgencyTag(job, applied) {
  if (job.status === 'encerrada' || applied) return null;
  const hash = ((job.id * 2654435761) >>> 0) % 100;
  if (hash < 12) return { text: '⏳ Encerrando em breve', style: 'bg-orange-50 text-orange-700 border-orange-200' };
  if (hash > 88) return { text: '🔥 Últimas vagas', style: 'bg-red-50 text-red-700 border-red-200' };
  return null;
}

export default function CardVaga({ job, onApply, applied, hasResume = true, jobViews, jobApplications }) {
  const isClosed = job.status === 'encerrada';
  const urgencyTag = getUrgencyTag(job, applied);

  return (
    <div className={`bg-white border rounded-xl p-4 sm:p-5 w-full max-w-full overflow-hidden box-border transition-all duration-200 ${
      isClosed
        ? 'border-gray-200 bg-gray-50/60 opacity-60'
        : applied
          ? 'border-emerald-200 bg-emerald-50/30'
          : 'border-gray-200 hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0 overflow-hidden">
          {/* Urgency / Closed badges */}
          {isClosed && (
            <div className="mb-2.5">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-200 text-gray-600 border border-gray-300">
                ❌ Vaga encerrada
              </span>
            </div>
          )}
          {urgencyTag && (
            <div className="mb-2.5">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${urgencyTag.style}`}>
                {urgencyTag.text}
              </span>
            </div>
          )}

          <div className="flex items-center gap-3 mb-2.5 min-w-0">
            {job.logo ? (
              <img
                src={cacheBust(job.logo)}
                alt={job.company}
                className="w-10 h-10 rounded-xl object-cover shrink-0 border border-gray-100"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
            ) : null}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
              applied ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'
            }`} style={job.logo ? { display: 'none' } : {}}>
              {job.company.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 truncate">{job.title}</h3>
              <p className="text-sm text-indigo-600 font-medium truncate">{job.company}</p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100 max-w-full">
              <span className="truncate">📍 {job.location}</span>
            </span>
            {job.workType && (
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md border ${workTypeColors[job.workType] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                {workTypeIcons[job.workType] || ''} {job.workType}
              </span>
            )}
            {job.level && (
              <span className={`text-xs font-medium px-2 py-1 rounded-md border ${levelColors[job.level] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                {job.level}
              </span>
            )}
            {job.category && (
              <span className="text-xs font-medium px-2 py-1 rounded-md border bg-indigo-50 text-indigo-600 border-indigo-200">
                {job.category}
              </span>
            )}
            {job.badges && job.badges.filter(b =>
              !['Home Office','Presencial','Híbrido','Sem experiência','Júnior','Pleno','Sênior','Autônomo'].includes(b)
              && b !== job.category
            ).map((badge, i) => (
              <span key={i} className="text-xs font-medium px-2 py-1 rounded-md border bg-teal-50 text-teal-700 border-teal-200">
                🎓 {badge}
              </span>
            ))}
          </div>

          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-2 break-words">{job.description}</p>

          <p className="text-[11px] text-gray-400 leading-relaxed mb-2.5 break-words">
            ℹ️ Para mais informações sobre a vaga, detalhes do processo seletivo e benefícios, consulte diretamente com a empresa durante a entrevista.
          </p>

          {/* Salary & workload */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {job.salary && (
              <span className="text-sm font-bold text-emerald-700">
                💰 {job.salary}
              </span>
            )}
            {job.cargaHoraria && (
              <span className="text-xs text-gray-500">
                🕐 {job.cargaHoraria}
              </span>
            )}
            {job.informal && (
              <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Autônomo
              </span>
            )}
          </div>

          {/* Activity indicators */}
          {!isClosed && (jobViews || jobApplications) && (
            <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-gray-400">
              {jobViews > 0 && <span>👁️ {jobViews} visualizações</span>}
              {jobApplications > 0 && <span>📩 {jobApplications} candidaturas</span>}
            </div>
          )}
        </div>

        <div className="shrink-0 w-full sm:w-auto">
          {isClosed ? (
            <span className="inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-500 text-xs font-medium px-4 py-2.5 rounded-xl w-full sm:w-auto border border-gray-200">
              Vaga encerrada
            </span>
          ) : applied ? (
            <span className="inline-flex items-center justify-center gap-2 bg-emerald-100 text-emerald-700 text-xs font-semibold px-4 py-2.5 rounded-xl w-full sm:w-auto border border-emerald-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Candidatura enviada ✨
            </span>
          ) : !hasResume ? (
            <button
              onClick={() => onApply(job)}
              className="inline-flex items-center justify-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-medium px-4 py-2.5 rounded-xl border border-amber-200 cursor-pointer hover:bg-amber-100 transition-all duration-200 w-full sm:w-auto"
            >
              📋 Criar currículo primeiro
            </button>
          ) : (
            <button
              onClick={() => onApply(job)}
              className="inline-flex items-center justify-center gap-1.5 bg-indigo-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all duration-200 active:scale-95 w-full sm:w-auto"
            >
              🚀 Quero me candidatar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
