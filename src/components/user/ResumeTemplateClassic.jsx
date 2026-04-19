import { parseBlocks, toList } from './resumeUtils';

function SectionTitle({ children }) {
  return (
    <div className="mb-2">
      <h2 className="text-[12px] font-bold text-gray-900 uppercase tracking-[0.12em]">{children}</h2>
      <div className="h-px bg-gray-300 mt-1" />
    </div>
  );
}

function Bullet({ children }) {
  return (
    <div className="flex items-start gap-2 text-[11px] text-gray-700 leading-relaxed">
      <span className="text-gray-400 mt-[3px] shrink-0 text-[8px]">●</span>
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
          {block.header && (block.items.length > 0 || !asBullets) && block.header && block.items.length > 0 && (
            <p className="text-[11px] font-semibold text-gray-800">{block.header}</p>
          )}
          {block.header && block.items.length === 0 && !asBullets && (
            <p className="text-[11px] font-semibold text-gray-800">{block.header}</p>
          )}
          {block.items.length > 0 && (
            <div className="mt-0.5 space-y-px">
              {block.items.map((item, j) => (
                <Bullet key={j}>{item}</Bullet>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Clássico Brasileiro — limpo, centrado, padrão brasileiro
export default function ResumeTemplateClassic({ data }) {
  const { nome, cargo, resumo, email, telefone, endereco, linkedin, experiencia, formacao, habilidades, cursos, idiomas, photo } = data;

  const expBlocks = parseBlocks(experiencia);
  const eduBlocks = parseBlocks(formacao);
  const skillList = toList(habilidades);
  const langList = toList(idiomas);
  const courseBlocks = parseBlocks(cursos);

  return (
    <div className="px-10 py-8" style={{ minHeight: '297mm', fontFamily: "'Inter', sans-serif" }}>
      {/* Header centrado */}
      <div className="text-center pb-3">
        {photo && (
          <img src={photo} alt={nome} className="w-[72px] h-[72px] rounded-full object-cover mx-auto mb-2" />
        )}
        <h1 className="text-[24px] font-bold text-gray-900 uppercase tracking-wide leading-tight">
          {nome || 'Seu Nome'}
        </h1>
        {cargo && (
          <p className="text-[12px] text-gray-500 font-medium mt-0.5 tracking-wide">{cargo}</p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-x-2 mt-2 text-[10px] text-gray-500">
          {telefone && <span>📱 {telefone}</span>}
          {telefone && email && <span className="text-gray-300">·</span>}
          {email && <span>✉ {email}</span>}
          {(telefone || email) && endereco && <span className="text-gray-300">·</span>}
          {endereco && <span>📍 {endereco}</span>}
          {(telefone || email || endereco) && linkedin && <span className="text-gray-300">·</span>}
          {linkedin && <span>🔗 {linkedin}</span>}
        </div>
      </div>

      <div className="h-[2px] bg-gray-800 mb-5" />

      <div className="space-y-4">
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

        {skillList.length > 0 && (
          <section>
            <SectionTitle>HABILIDADES</SectionTitle>
            <div className="grid grid-cols-2 gap-x-8 gap-y-px">
              {skillList.map((s, i) => <Bullet key={i}>{s}</Bullet>)}
            </div>
          </section>
        )}

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
  );
}
