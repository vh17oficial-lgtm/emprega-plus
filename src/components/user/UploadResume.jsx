import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';

export default function UploadResume() {
  const { saveResume } = useAppContext();
  const [file, setFile] = useState(null);
  const [customName, setCustomName] = useState('');
  const [dragging, setDragging] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleFile = (f) => {
    if (f && (f.type === 'application/pdf' || f.name.endsWith('.doc') || f.name.endsWith('.docx'))) {
      setFile(f);
      setCustomName(f.name.replace(/\.[^.]+$/, ''));
      setUploaded(false);
    } else {
      alert('Por favor, envie um arquivo PDF ou DOC.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const getExtension = () => file?.name.match(/\.[^.]+$/)?.[0] || '.pdf';

  const handleSave = async () => {
    if (!file) return;
    const displayName = (customName.trim() || file.name.replace(/\.[^.]+$/, '')) + getExtension();
    await saveResume({
      type: 'upload',
      template: 'upload',
      fileName: displayName,
      fileSize: `${(file.size / 1024).toFixed(1)} KB`,
    });
    setUploaded(true);
    setTimeout(() => { setUploaded(false); setFile(null); setCustomName(''); }, 3000);
  };

  return (
    <div className="space-y-6">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
          dragging
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
        }`}
      >
        <div className="text-5xl mb-4">📁</div>
        <p className="text-lg font-medium text-gray-700 mb-2">
          Arraste seu currículo aqui
        </p>
        <p className="text-sm text-gray-500 mb-4">ou</p>
        <label className="inline-block bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium cursor-pointer hover:bg-indigo-700 transition-colors">
          Escolher arquivo
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </label>
        <p className="text-xs text-gray-400 mt-3">Formatos aceitos: PDF, DOC, DOCX</p>
      </div>

      {file && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-emerald-600 text-lg">✓</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{file.name}</p>
              <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              onClick={() => { setFile(null); setUploaded(false); setCustomName(''); }}
              className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Rename field */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Renomear currículo (opcional)</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Nome do currículo"
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
              />
              <span className="text-xs text-gray-400 shrink-0">{getExtension()}</span>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={uploaded}
            className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              uploaded
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {uploaded ? '✓ Salvo em Meus Currículos!' : '💾 Salvar em Meus Currículos'}
          </button>
        </div>
      )}
    </div>
  );
}
