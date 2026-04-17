import { useEffect } from 'react';
import Portal from '../common/Portal';
import ResumeTemplateClassic from './ResumeTemplateClassic';
import ResumeTemplateModern from './ResumeTemplateModern';
import ResumeTemplateMinimal from './ResumeTemplateMinimal';
import { cacheBust } from '../../utils/cacheBust';

const templateMap = {
  classico: ResumeTemplateClassic,
  profissional: ResumeTemplateModern,
  executivo: ResumeTemplateMinimal,
};

// Known company domains for realistic emails
const knownDomains = {
  'amazon brasil': 'amazon.com.br', 'shopee brasil': 'shopee.com.br',
  'magazine luiza': 'magazineluiza.com.br', 'mercado livre': 'mercadolivre.com.br',
  'ifood': 'ifood.com.br', 'nubank': 'nubank.com.br', 'rappi': 'rappi.com.br',
  'americanas': 'americanas.com.br', 'casas bahia': 'casasbahia.com.br',
  'renner': 'lojasrenner.com.br', 'c&a brasil': 'cea.com.br',
  'riachuelo': 'riachuelo.com.br', 'natura': 'natura.com.br',
  'o boticário': 'boticario.com.br', 'stone': 'stone.com.br',
  'pagseguro': 'pagseguro.com.br', 'totvs': 'totvs.com',
  'vivo': 'vivo.com.br', 'claro': 'claro.com.br', 'tim': 'tim.com.br',
  'itaú': 'itau.com.br', 'bradesco': 'bradesco.com.br',
  'santander': 'santander.com.br', 'btg pactual': 'btgpactual.com',
  'xp inc.': 'xpi.com.br', 'locaweb': 'locaweb.com.br',
  'hotmart': 'hotmart.com', 'picpay': 'picpay.com', 'neon': 'neon.com.br',
  'inter': 'bancointer.com.br', 'quintoandar': 'quintoandar.com.br',
  'gympass': 'gympass.com', 'loggi': 'loggi.com', 'creditas': 'creditas.com',
  '99': '99app.com', 'globo': 'globo.com', 'uol': 'uol.com.br',
  'carrefour': 'carrefour.com.br', 'samsung brasil': 'samsung.com',
  'dell brasil': 'dell.com', 'rd station': 'rdstation.com',
  'ci&t': 'ciandt.com', 'loft': 'loft.com.br',
  'madeiramadeira': 'madeiramadeira.com.br',
};

const emailPrefixes = ['rh', 'recrutamento', 'talentos', 'vagas', 'selecao', 'contato', 'gestao', 'pessoas'];

const signatories = [
  { nome: 'Lucas Andrade', cargo: 'Especialista em Recrutamento' },
  { nome: 'Juliana Souza', cargo: 'Analista de Recrutamento' },
  { nome: 'Rafael Mendes', cargo: 'Talent Acquisition' },
  { nome: 'Camila Oliveira', cargo: 'Gestão de Pessoas' },
  { nome: 'Fernanda Costa', cargo: 'Especialista em Recrutamento' },
  { nome: 'Mateus Lima', cargo: 'Analista de Talentos' },
  { nome: 'Beatriz Santos', cargo: 'Talent Acquisition' },
  { nome: 'Gabriel Ferreira', cargo: 'Gestão de Pessoas' },
  { nome: 'Isabela Rodrigues', cargo: 'Especialista em Recrutamento' },
  { nome: 'Thiago Almeida', cargo: 'Analista de Recrutamento' },
];

function generateCompanyEmail(companyName) {
  const lower = companyName.toLowerCase().trim();
  const known = knownDomains[lower];
  if (known) {
    const prefix = emailPrefixes[Math.abs(hashStr(lower)) % emailPrefixes.length];
    return `${prefix}@${known}`;
  }
  const slug = lower
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+(ltda|sa|s\.a\.|me|eireli)\.?$/i, '')
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 20);
  const tld = hashStr(lower) % 3 === 0 ? '.com' : '.com.br';
  const prefix = emailPrefixes[Math.abs(hashStr(lower + 'prefix')) % emailPrefixes.length];
  return `${prefix}@${slug}${tld}`;
}

function getSignatory(jobId) {
  return signatories[Math.abs(jobId || 0) % signatories.length];
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function formatSentDate(isoStr) {
  try {
    const d = isoStr ? new Date(isoStr) : new Date();
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return new Date().toLocaleDateString('pt-BR'); }
}

function generateAttachmentName(resume) {
  if (!resume) return 'Curriculo_Candidato.pdf';
  const isUpload = resume.type === 'upload' || resume.template === 'upload';
  if (isUpload && resume.fileName) {
    return resume.fileName;
  }
  // Build from resume data
  const parts = [];
  if (resume.nome) parts.push(resume.nome);
  else parts.push('Curriculo');
  if (resume.cargo) parts.push(resume.cargo);
  const name = parts.join('_')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  return `Curriculo_${name}.pdf`;
}

// Simple deterministic hash for consistent email per company
function hashStr(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export default function EmailDetailModal({ isOpen, onClose, job, resume, appliedAt }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen || !job) return null;

  const userName = resume?.nome || 'Candidato';
  const isUpload = resume?.type === 'upload';
  const companyEmail = generateCompanyEmail(job.company);
  const attachmentName = generateAttachmentName(resume);
  const signatory = getSignatory(job.id);
  const greeting = getGreeting();
  const sentDate = formatSentDate(appliedAt);

  const Template = resume?.template && templateMap[resume.template] ? templateMap[resume.template] : null;

  return (
    <Portal>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s]" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-gray-100 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-[slideUp_0.3s_ease-out]">
        {/* Top bar */}
        <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              📩 Detalhes da Candidatura
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Enviado em {sentDate}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Email card — Gmail style */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Email header */}
            <div className="px-6 py-4 border-b border-gray-100">
              {/* Subject */}
              <h4 className="text-[15px] font-semibold text-gray-900 mb-3">
                Candidatura — {job.title} • {job.company}
              </h4>
              {/* From / To */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center shrink-0 bg-white border border-gray-100">
                    <img src={cacheBust("/logo-escudo.png")} alt="E+" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900">Emprega+</span>
                      <span className="text-xs text-gray-400">&lt;contato@empregamais.com&gt;</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      para <span className="text-gray-600">{companyEmail}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0 hidden sm:block">{sentDate}</span>
                </div>
              </div>
            </div>

            {/* Email body */}
            <div className="px-6 py-5">
              <div className="text-sm text-gray-700 leading-relaxed space-y-4" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
                <p>{greeting},</p>
                <p>
                  Segue para análise o currículo de <strong className="text-gray-900">{userName}</strong>,
                  candidato(a) à vaga de <strong className="text-gray-900">{job.title}</strong>,
                  enviado através da plataforma Emprega+.
                </p>
                <p>
                  O(A) candidato(a) demonstra interesse na oportunidade e está disponível para
                  contato imediato. Caso o perfil esteja alinhado com a posição, pedimos a gentileza
                  de retornar para que possamos facilitar o próximo passo do processo seletivo.
                </p>
                <p>Ficamos à disposição para mais informações.</p>

                {/* Signature */}
                <div className="pt-4 mt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-700">Atenciosamente,</p>
                  <div className="mt-3 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                      <span className="text-white text-xs font-bold">
                        {signatory.nome.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{signatory.nome}</p>
                      <p className="text-xs text-gray-500">{signatory.cargo}</p>
                      <p className="text-xs font-semibold text-indigo-600 mt-0.5">Emprega+</p>
                      <p className="text-xs text-gray-400 mt-0.5">contato@empregamais.com • empregamais.com.br</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Attachment bar */}
            <div className="px-6 pb-5">
              <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">Anexo</p>
              <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 hover:bg-gray-100 transition-colors">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-red-600 text-xs font-bold">PDF</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {attachmentName}
                  </p>
                  <p className="text-xs text-gray-400">Currículo do candidato • Documento PDF</p>
                </div>
                <span className="text-gray-400 shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </span>
              </div>
            </div>
          </div>

          {/* Resume preview — created resume */}
          {Template && resume && !isUpload && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                📄 Pré-visualização do currículo anexado
              </p>
              <div
                className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
                style={{ height: '420px' }}
              >
                <div
                  className="origin-top-left"
                  style={{ width: '794px', transform: 'scale(0.62)' }}
                >
                  <Template data={resume} />
                </div>
              </div>
            </div>
          )}

          {/* Resume preview — uploaded file */}
          {isUpload && resume && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                📄 Arquivo anexado
              </p>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="text-5xl mb-3">📄</div>
                <p className="text-sm font-medium text-gray-700">{resume.fileName}</p>
                <p className="text-xs text-gray-400 mt-1">{resume.fileSize}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
    </Portal>
  );
}
