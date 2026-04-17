import { useState, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import PdfUpsellModal from '../common/PdfUpsellModal';
import ResumeTemplateClassic from './ResumeTemplateClassic';
import ResumeTemplateModern from './ResumeTemplateModern';
import ResumeTemplateMinimal from './ResumeTemplateMinimal';
import { downloadResumePDF } from '../../utils/resumeDownload';

const templateComponents = {
  classico: ResumeTemplateClassic,
  profissional: ResumeTemplateModern,
  executivo: ResumeTemplateMinimal,
};

const templateLabels = {
  classico: { name: 'Clássico', color: 'bg-gray-100 text-gray-700' },
  profissional: { name: 'Profissional', color: 'bg-slate-100 text-slate-700' },
  executivo: { name: 'Executivo', color: 'bg-indigo-100 text-indigo-700' },
  upload: { name: 'Upload', color: 'bg-blue-100 text-blue-700' },
};

export default function MyResumes() {
  const { savedResumes, deleteResume } = useAppContext();
  const { hasPdfAccess, purchasePdfAccess } = useAuth();
  const [downloadingId, setDownloadingId] = useState(null);
  const [showPdfUpsell, setShowPdfUpsell] = useState(false);
  const [pendingResume, setPendingResume] = useState(null);
  const renderRef = useRef(null);

  const doDownload = useCallback(async (resume) => {
    if (downloadingId) return;
    setDownloadingId(resume.id);

    try {
      const container = document.createElement('div');
      container.style.cssText = 'position:fixed;left:-9999px;top:0;width:794px;z-index:-1;background:#fff;';
      document.body.appendChild(container);
      renderRef.current = container;

      const Template = templateComponents[resume.template] || ResumeTemplateClassic;

      const root = createRoot(container);
      await new Promise((resolve) => {
        root.render(<Template data={resume} />);
        setTimeout(resolve, 300);
      });

      const fileName = resume.nome ? `Curriculo_${resume.nome}` : 'Curriculo';
      await downloadResumePDF(container, fileName);

      root.unmount();
      document.body.removeChild(container);
    } catch (e) {
      console.error('Erro ao gerar PDF:', e);
      if (renderRef.current?.parentNode) renderRef.current.parentNode.removeChild(renderRef.current);
    } finally {
      setDownloadingId(null);
      renderRef.current = null;
    }
  }, [downloadingId]);

  const handleDownload = useCallback((resume) => {
    if (hasPdfAccess()) {
      doDownload(resume);
    } else {
      setPendingResume(resume);
      setShowPdfUpsell(true);
    }
  }, [hasPdfAccess, doDownload]);

  const handlePdfUnlocked = (price) => {
    purchasePdfAccess(price);
    setShowPdfUpsell(false);
    if (pendingResume) {
      setTimeout(() => doDownload(pendingResume), 400);
      setPendingResume(null);
    }
  };

  if (savedResumes.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">📂</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum currículo salvo</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Crie um currículo na aba "Criar Currículo" e clique em "Salvar", ou envie um arquivo na aba "Enviar Currículo".
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">{savedResumes.length} currículo(s) salvo(s)</p>
      {savedResumes.map((resume) => {
        const tpl = templateLabels[resume.template] || templateLabels.upload;
        return (
          <div key={resume.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                  {resume.type === 'upload' ? (
                    <span className="text-lg">📄</span>
                  ) : (
                    <span className="text-indigo-600 font-bold text-sm">{resume.nome?.charAt(0) || 'C'}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-medium text-gray-900 truncate">
                      {resume.type === 'upload' ? resume.fileName : resume.nome}
                    </h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tpl.color}`}>
                      {tpl.name}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {resume.type === 'upload'
                      ? `${resume.fileSize} • Enviado em ${resume.savedAt}`
                      : `${resume.cargo || 'Sem cargo'} • ${resume.email} • Salvo em ${resume.savedAt}`
                    }
                  </p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                {resume.type !== 'upload' && resume.template !== 'upload' && (
                  <Button
                    variant="primary"
                    onClick={() => handleDownload(resume)}
                    disabled={downloadingId === resume.id}
                    className="!py-1.5 !px-3 !text-xs"
                  >
                    {downloadingId === resume.id ? '⏳ Gerando...' : '⬇️ Baixar PDF'}
                  </Button>
                )}
                <Button variant="danger" onClick={async () => await deleteResume(resume.id)} className="!py-1.5 !px-3 !text-xs shrink-0">
                  🗑️ Excluir
                </Button>
              </div>
            </div>
          </div>
        );
      })}

      <PdfUpsellModal
        isOpen={showPdfUpsell}
        onClose={() => { setShowPdfUpsell(false); setPendingResume(null); }}
        onUnlocked={handlePdfUnlocked}
      />
    </div>
  );
}
