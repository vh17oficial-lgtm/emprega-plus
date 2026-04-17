import Portal from '../common/Portal';

const templateLabels = {
  classico: { label: 'Clássico', color: 'bg-blue-50 text-blue-700' },
  profissional: { label: 'Profissional', color: 'bg-emerald-50 text-emerald-700' },
  executivo: { label: 'Executivo', color: 'bg-amber-50 text-amber-700' },
  upload: { label: 'Upload', color: 'bg-purple-50 text-purple-700' },
};

export default function ResumeSelectorModal({ isOpen, onClose, resumes, onSelect, jobTitle }) {
  if (!isOpen || !resumes?.length) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col animate-in z-10">
          {/* Header */}
          <div className="p-6 pb-4 border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Escolha qual currículo enviar</h2>
                {jobTitle && (
                  <p className="text-sm text-gray-500 mt-1">
                    Vaga: <span className="font-medium text-indigo-600">{jobTitle}</span>
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Resume list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {resumes.map((resume) => {
              const isUpload = resume.type === 'upload' || resume.template === 'upload';
              const tpl = templateLabels[resume.template] || templateLabels.classico;
              const displayName = isUpload
                ? (resume.fileName || 'Currículo enviado')
                : (resume.nome || resume.cargo || 'Currículo criado');
              const subtitle = isUpload
                ? `Arquivo: ${resume.fileName || 'PDF'} • ${resume.fileSize || ''}`
                : `${resume.cargo || 'Sem cargo'} • Modelo ${tpl.label}`;

              return (
                <button
                  key={resume.id}
                  onClick={() => onSelect(resume)}
                  className="w-full text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    {/* Icon */}
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      isUpload ? 'bg-purple-50' : 'bg-indigo-50'
                    }`}>
                      <span className="text-xl">{isUpload ? '📎' : '📄'}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                        {displayName}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{subtitle}</p>
                      {resume.savedAt && (
                        <p className="text-[10px] text-gray-400 mt-0.5">Salvo em: {resume.savedAt}</p>
                      )}
                    </div>

                    {/* Badge + Arrow */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${tpl.color}`}>
                        {tpl.label}
                      </span>
                      <svg className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 pt-3 border-t border-gray-100">
            <button
              onClick={onClose}
              className="w-full py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes animate-in {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-in { animation: animate-in 0.2s ease-out; }
      `}</style>
    </Portal>
  );
}
