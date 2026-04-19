import { parseBlocks, toList } from './resumeUtils';

function SidebarTitle({ children }) {
  return (
    <div className="mb-2">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-300">{children}</h3>
      <div className="h-px bg-slate-600 mt-1" />
    </div>
  );
}

function MainTitle({ children }) {
  return (
    <div className="mb-2">
      <h2 className="text-[12px] font-bold text-gray-900 uppercase tracking-[0.12em]">{children}</h2>
      <div className="h-px bg-gray-300 mt-1" />
    </div>
  );
}

function Bullet({ children, light = false }) {
  return (
    <div className={`flex items-start gap-2 text-[11px] leading-relaxed ${light ? 'text-slate-300' : 'text-gray-700'}`}>
      <span className={`mt-[3px] shrink-0 text-[8px] ${light ? 'text-slate-500' : 'text-gray-400'}`}>●</span>
      <span>{children}</span>
    </div>
  );
}

function BlockList({ blocks, asBullets = false, light = false }) {
  return (
    <div className="space-y-2">
      {blocks.map((block, i) => (
        <div key={i}>
          {block.header && block.items.length === 0 && asBullets && (
            <Bullet light={light}>{block.header}</Bullet>
          )}
          {block.header && block.items.length === 0 && !asBullets && (
            <p className={`text-[11px] font-semibold ${light ? 'text-white' : 'text-gray-800'}`}>{block.header}</p>
          )}
          {block.header && block.items.length > 0 && (
            <p className={`text-[11px] font-semibold ${light ? 'text-white' : 'text-gray-800'}`}>{block.header}</p>
          )}
          {block.items.length > 0 && (
            <div className="mt-0.5 space-y-px">
              {block.items.map((item, j) => <Bullet key={j} light={light}>{item}</Bullet>)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Executivo — coluna lateral escura + conteúdo principal
export default function ResumeTemplateMinimal({ data }) {
  const { nome, cargo, resumo, email, telefone, endereco, linkedin, experiencia, formacao, habilidades, cursos, idiomas, photo } = data;

  const expBlocks = parseBlocks(experiencia);
  const eduBlocks = parseBlocks(formacao);
  const skillList = toList(habilidades);
  const langList = toList(idiomas);
  const courseBlocks = parseBlocks(cursos);

  return (
    <div className="flex" style={{ minHeight: '297mm', fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <div className="w-[32%] bg-slate-800 text-white px-5 py-7 shrink-0 space-y-5">
        {/* Photo */}
        {photo && (
          <div className="flex justify-center">
            <img src={photo} alt={nome} className="w-[88px] h-[88px] rounded-full object-cover border-[3px] border-slate-600" />
          </div>
        )}

        {/* Name */}
        <div>
          <h1 className="text-[17px] font-bold uppercase tracking-wide leading-tight text-white">
            {nome || 'Seu Nome'}
          </h1>
          {cargo && (
            <p className="text-[10px] text-slate-400 font-medium mt-1 tracking-wide">{cargo}</p>
          )}
        </div>

        {/* Contact */}
        <div>
          <SidebarTitle>CONTATO</SidebarTitle>
          <div className="space-y-1.5 text-[10px] text-slate-300">
            {telefone && (
              <div className="flex items-start gap-2">
                <span className="text-slate-500 shrink-0">📱</span>
                <span>{telefone}</span>
              </div>
            )}
            {email && (
              <div className="flex items-start gap-2">
                <span className="text-slate-500 shrink-0">✉</span>
                <span className="break-all">{email}</span>
              </div>
            )}
            {endereco && (
              <div className="flex items-start gap-2">
                <span className="text-slate-500 shrink-0">📍</span>
                <span>{endereco}</span>
              </div>
            )}
            {linkedin && (
              <div className="flex items-start gap-2">
                <span className="text-slate-500 shrink-0">🔗</span>
                <span className="break-all">{linkedin}</span>
              </div>
            )}
          </div>
        </div>

        {/* Skills */}
        {skillList.length > 0 && (
          <div>
            <SidebarTitle>HABILIDADES</SidebarTitle>
            <div className="space-y-px">
              {skillList.map((s, i) => <Bullet key={i} light>{s}</Bullet>)}
            </div>
          </div>
        )}

        {/* Languages */}
        {langList.length > 0 && (
          <div>
            <SidebarTitle>IDIOMAS</SidebarTitle>
            <div className="space-y-px">
              {langList.map((l, i) => <Bullet key={i} light>{l}</Bullet>)}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 px-7 py-7 space-y-4">
        {resumo && (
          <section>
            <MainTitle>OBJETIVO PROFISSIONAL</MainTitle>
            <p className="text-[11px] text-gray-700 leading-relaxed">{resumo}</p>
          </section>
        )}

        {expBlocks.length > 0 && (
          <section>
            <MainTitle>EXPERIÊNCIA PROFISSIONAL</MainTitle>
            <BlockList blocks={expBlocks} />
          </section>
        )}

        {eduBlocks.length > 0 && (
          <section>
            <MainTitle>FORMAÇÃO ACADÊMICA</MainTitle>
            <BlockList blocks={eduBlocks} asBullets />
          </section>
        )}

        {courseBlocks.length > 0 && (
          <section>
            <MainTitle>CURSOS E CERTIFICAÇÕES</MainTitle>
            <BlockList blocks={courseBlocks} asBullets />
          </section>
        )}
      </div>
    </div>
  );
}
