import { useEffect, useState } from 'react';
import Portal from '../common/Portal';

const emptyForm = {
  title: '',
  company: '',
  workType: 'presencial',
  salary: '',
  description: '',
};

export default function PostJobModal({ isOpen, onClose, onSubmitted }) {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setForm(emptyForm);
      setSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const canSubmit =
    form.title.trim().length >= 2 &&
    form.company.trim().length >= 2 &&
    form.salary.trim().length >= 1 &&
    form.description.trim().length >= 5;

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onSubmitted?.();
      onClose?.();
    }, 500);
  };

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const FormFields = (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Cargo da vaga</label>
        <input
          type="text"
          value={form.title}
          onChange={update('title')}
          placeholder="Ex: Assistente Administrativo"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Nome da empresa</label>
        <input
          type="text"
          value={form.company}
          onChange={update('company')}
          placeholder="Ex: Minha Empresa LTDA"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de trabalho</label>
          <select
            value={form.workType}
            onChange={update('workType')}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
          >
            <option value="presencial">Presencial</option>
            <option value="remoto">Remoto</option>
            <option value="hibrido">Híbrido</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Salário</label>
          <input
            type="text"
            value={form.salary}
            onChange={update('salary')}
            placeholder="R$ 1.500"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Descrição</label>
        <textarea
          value={form.description}
          onChange={update('description')}
          rows={4}
          placeholder="Descreva as atividades, requisitos e benefícios..."
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={!canSubmit || submitting}
        className="w-full bg-indigo-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Enviando...
          </span>
        ) : 'Enviar vaga'}
      </button>
      <p className="text-center text-[10px] text-gray-400">
        Sua vaga passará por análise antes de ser publicada.
      </p>
    </form>
  );

  return (
    <Portal>
      {/* Desktop: centered modal */}
      <div className="hidden lg:flex fixed inset-0 z-[70] items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-[pjFade_0.2s_ease-out]" onClick={submitting ? undefined : onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-[pjScale_0.25s_ease-out]">
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4 text-white flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold">Anunciar vaga</h3>
              <p className="text-xs text-white/80">Publique uma vaga em nossa plataforma</p>
            </div>
            <button
              onClick={submitting ? undefined : onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>
          <div className="p-6">{FormFields}</div>
        </div>
      </div>

      {/* Mobile: bottom sheet */}
      <div className="lg:hidden fixed inset-0 z-[70] flex flex-col">
        <div className="absolute inset-0 bg-black/50 animate-[pjFade_0.2s_ease-out]" onClick={submitting ? undefined : onClose} />
        <div className="relative mt-auto bg-white rounded-t-3xl shadow-2xl flex flex-col max-h-[92vh] animate-[pjSlide_0.28s_ease-out]">
          <div className="flex items-center justify-between px-4 pt-3 pb-1 shrink-0">
            <span className="block w-12 h-1.5 rounded-full bg-gray-300 mx-auto" />
            <button
              onClick={submitting ? undefined : onClose}
              className="absolute right-3 top-3 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 cursor-pointer"
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>
          <div className="px-5 pb-2 pt-1">
            <h3 className="text-base font-bold text-gray-900">Anunciar vaga</h3>
            <p className="text-xs text-gray-500">Publique uma vaga em nossa plataforma</p>
          </div>
          <div className="flex-1 overflow-y-auto px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {FormFields}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pjFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pjScale { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes pjSlide { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </Portal>
  );
}
