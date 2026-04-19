// Creative professional template - bold header, gradient accent
export default function ResumeTemplateCreative({ data }) {
  const { nome, cargo, resumo, email, telefone, endereco, linkedin, experiencia, formacao, habilidades, cursos, idiomas, photo } = data;

  return (
    <div className="flex flex-col" style={{ minHeight: '297mm', fontFamily: "'Inter', sans-serif" }}>
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-violet-700 via-indigo-700 to-slate-800 text-white px-7 py-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-violet-300 rounded-full blur-2xl" />
        </div>
        <div className="relative flex items-center gap-5">
          {photo && (
            <img src={photo} alt={nome} className="w-20 h-20 rounded-2xl object-cover border-2 border-white/20 shadow-lg shrink-0" />
          )}
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight leading-tight">{nome || 'Seu Nome'}</h1>
            {cargo && <p className="text-sm font-medium text-violet-200 mt-0.5">{cargo}</p>}
            <div className="flex flex-wrap gap-x-3 mt-2 text-[10px] text-violet-300">
              {email && <span>{email}</span>}
              {telefone && <span>{telefone}</span>}
              {endereco && <span>{endereco}</span>}
              {linkedin && <span>{linkedin}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-7 space-y-4">
        {/* Summary */}
        {resumo && (
          <div className="bg-violet-50 rounded-lg p-3 border-l-3 border-violet-500">
            <p className="text-[11px] text-gray-700 leading-relaxed">{resumo}</p>
          </div>
        )}

        {/* Experience */}
        {experiencia && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-800">Experiência</h2>
            </div>
            <p className="text-[11px] text-gray-700 whitespace-pre-line leading-relaxed pl-4">{experiencia}</p>
          </div>
        )}

        {/* Education */}
        {formacao && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-800">Formação</h2>
            </div>
            <p className="text-[11px] text-gray-700 whitespace-pre-line leading-relaxed pl-4">{formacao}</p>
          </div>
        )}

        {/* Bottom grid */}
        <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-100">
          {habilidades && (
            <div>
              <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-violet-600 mb-1.5">Skills</h3>
              <div className="flex flex-wrap gap-1">
                {habilidades.split(',').filter(Boolean).map((s, i) => (
                  <span key={i} className="bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded text-[9px] font-medium">{s.trim()}</span>
                ))}
              </div>
            </div>
          )}

          {idiomas && (
            <div>
              <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-violet-600 mb-1.5">Idiomas</h3>
              <div className="space-y-0.5">
                {idiomas.split(',').filter(Boolean).map((l, i) => (
                  <p key={i} className="text-[10px] text-gray-600">{l.trim()}</p>
                ))}
              </div>
            </div>
          )}

          {cursos && (
            <div>
              <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-violet-600 mb-1.5">Certificações</h3>
              <p className="text-[10px] text-gray-600 whitespace-pre-line">{cursos}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
