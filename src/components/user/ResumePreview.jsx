import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import PdfUpsellModal from '../common/PdfUpsellModal';
import TemplateSelector from './TemplateSelector';
import ResumeTemplateClassic from './ResumeTemplateClassic';
import ResumeTemplateModern from './ResumeTemplateModern';
import ResumeTemplateMinimal from './ResumeTemplateMinimal';
import { downloadResumePDF } from '../../utils/resumeDownload';

const templates = {
  classico: ResumeTemplateClassic,
  profissional: ResumeTemplateModern,
  executivo: ResumeTemplateMinimal,
};

export default function ResumePreview({ data, onBack }) {
  const { saveResume } = useAppContext();
  const { hasPdfAccess, purchasePdfAccess } = useAuth();
  const [currentTemplate, setCurrentTemplate] = useState(data.template || 'classico');
  const [saved, setSaved] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showPdfUpsell, setShowPdfUpsell] = useState(false);

  const Template = templates[currentTemplate] || ResumeTemplateClassic;

  const handleSave = () => {
    saveResume({ ...data, template: currentTemplate });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const doDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const container = document.createElement('div');
      container.style.cssText = 'position:fixed;left:-9999px;top:0;width:794px;z-index:-1;background:#fff;';
      document.body.appendChild(container);

      const root = createRoot(container);
      await new Promise((resolve) => {
        root.render(<Template data={data} />);
        setTimeout(resolve, 300);
      });

      const fileName = data.nome ? `Curriculo_${data.nome}` : 'Curriculo';
      await downloadResumePDF(container, fileName);

      root.unmount();
      document.body.removeChild(container);
    } catch (e) {
      console.error('Erro ao gerar PDF:', e);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownload = () => {
    if (hasPdfAccess()) {
      doDownload();
    } else {
      setShowPdfUpsell(true);
    }
  };

  const handlePdfUnlocked = (price) => {
    purchasePdfAccess(price);
    setShowPdfUpsell(false);
    setTimeout(() => doDownload(), 400);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-gray-900">Pré-visualização</h3>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onBack}>← Editar dados</Button>
          <Button variant="primary" onClick={handleDownload} disabled={downloading}>
            {downloading ? '⏳ Gerando...' : '⬇️ Baixar PDF'}
          </Button>
          <Button variant="success" onClick={handleSave} disabled={saved}>
            {saved ? '✓ Salvo!' : '💾 Salvar Currículo'}
          </Button>
        </div>
      </div>

      <TemplateSelector selected={currentTemplate} onSelect={setCurrentTemplate} />

      <div className="flex justify-center py-4 bg-gray-100 rounded-2xl -mx-2 px-2">
        <div
          className="bg-white shadow-[0_4px_40px_rgba(0,0,0,0.12)] overflow-hidden origin-top"
          style={{
            width: '210mm',
            minHeight: '297mm',
            maxWidth: '100%',
          }}
        >
          <Template data={data} />
        </div>
      </div>

      <PdfUpsellModal
        isOpen={showPdfUpsell}
        onClose={() => setShowPdfUpsell(false)}
        onUnlocked={handlePdfUnlocked}
      />
    </div>
  );
}
