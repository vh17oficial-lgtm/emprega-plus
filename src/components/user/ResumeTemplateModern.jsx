import { parseBlocks, toList } from './resumeUtils';

function SectionTitle({ children }) {
  return (
    <div className="mb-2">
      <h2 className="text-[12px] font-bold text-gray-900 uppercase tracking-[0.12em]">{children}</h2>
      <div className="h-px bg-gray-300 mt-1" />
    </div>
  );
}

function Bullet({ children, className = 'text-gray-700' }) {
  return (
    <div className={`flex items-start gap-2 text-[11px] leading-relaxed ${className}`}>
      <span className="mt-[3px] shrink-0 text-[8px] opacity-50">●</span>
      <span>{children}</span>
    </div>
  );
}

function BlockList({ blocks, asBullets = false }) {
  return (
    <div className="space-y-2">
      {blocks.map((block, i) => (
        <div key={i}>
          {block.header && block.items.length === 0 && asBullets && (
            <Bullet>{block.header}</Bullet>
          )}
          {block.header && block.items.length === 0 && !asBullets && (
            <p className="text-[11px] font-semibold text-gray-800">{block.header}</p>
          )}
          {block.header && block.items.length > 0 && (
            <p className="text-[11px] font-semibold text-gray-800">{block.header}</p>
          )}
          {block.items.length > 0 && (
            <div className="mt-0.5 space-y-px">
              {block.items.map((item, j) => <Bullet key={j}>{item}</Bullet>)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Profissional — faixa escura no topo com foto, corpo branco
export default function ResumeTemplateModern({ data }) {
  const { nome, cargo, resumo, email, telefone, endereco, linkedin, experiencia, formacao, habilidades, cursos, idiomas, photo } = data;

  const expBlocks = parseBlocks(experiencia);
  const eduBlocks = parseBlocks(formacao);
  const skillList = toList(habilidades);
  const langList = toList(idiomas);
  const courseBlocks = parseBlocks(cursos);

  return (
    <div className="flex flex-col" style={{ minHeight: '297mm', fontFamily: "'Inter', sans-serif" }}>
      {/* Dark Header */}
      <div className="bg-slate-800 text-white px-10 py-7">
        <div className="flex items-center gap-5">
          {photo && (
            <img src={photo} alt={nome} className="w-[80px] h-[80px] rounded-full object-cover border-[3px] border-white/20 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-[24px] font-bold uppercase tracking-wide leading-tight">
              {nome || 'Seu Nome'}
            </h1>
            {cargo && (
              <p className="text-[13px] text-slate-300 font-medium mt-0.5 tracking-wide">{cargo}</p>
            )}
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2.5 text-[10px] text-slate-400">
              {telefone && <span>📱 {telefone}</span>}
              {email && <span>✉ {email}</span>}
              {endereco && <span>📍 {endereco}</span>}
              {linkedin && <span>🔗 {linkedin}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 px-10 py-7 space-y-4">
        {resumo && (
          <section>
            <SectionTitle>OBJETIVO PROFISSIONAL</SectionTitle>
            <p className="text-[11px] text-gray-700 leading-relaxed">{resumo}</p>
          </section>
        )}

        {expBlocks.length > 0 && (
          <section>
            <SectionTitle>EXPERIÊNCIA PROFISSIONAL</SectionTitle>
            <BlockList blocks={expBlocks} />
          </section>
        )}

        {eduBlocks.length > 0 && (
          <section>
            <SectionTitle>FORMAÇÃO ACADÊMICA</SectionTitle>
            <BlockList blocks={eduBlocks} asBullets />
          </section>
        )}

        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          {skillList.length > 0 && (
            <section>
              <SectionTitle>HABILIDADES</SectionTitle>
              <div className="space-y-px">
                {skillList.map((s, i) => <Bullet key={i}>{s}</Bullet>)}
              </div>
            </section>
          )}

          <div className="space-y-4">
            {langList.length > 0 && (
              <section>
                <SectionTitle>IDIOMAS</SectionTitle>
                <div className="space-y-px">
                  {langList.map((l, i) => <Bullet key={i}>{l}</Bullet>)}
                </div>
              </section>
            )}

            {courseBlocks.length > 0 && (
              <section>
                <SectionTitle>CURSOS E CERTIFICAÇÕES</SectionTitle>
                <BlockList blocks={courseBlocks} asBullets />
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
