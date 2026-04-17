import { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';

const inputClass = 'w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow';

function readFileAsDataURL(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}

const emptyForm = { name: '', role: '', text: '', photo: '', stars: 5 };

export default function TestimonialManager() {
  const { testimonials, updateTestimonials } = useAppContext();

  const [draft, setDraft] = useState(() => structuredClone(testimonials));
  const [saved, setSaved] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [showAdd, setShowAdd] = useState(false);
  const [newForm, setNewForm] = useState(emptyForm);

  const hasChanges = useMemo(() => JSON.stringify(draft) !== JSON.stringify(testimonials), [draft, testimonials]);

  const handleSave = () => { updateTestimonials(draft); setSaved(true); setTimeout(() => setSaved(false), 3000); };
  const handleDiscard = () => { setDraft(structuredClone(testimonials)); setSaved(false); };
  const nextId = () => Math.max(0, ...draft.map((t) => t.id)) + 1;

  const addTestimonial = () => {
    if (!newForm.name.trim() || !newForm.text.trim()) return;
    setDraft([...draft, { ...newForm, id: nextId(), active: true }]);
    setNewForm(emptyForm);
    setShowAdd(false);
    setSaved(false);
  };

  const deleteItem = (id) => { setDraft(draft.filter((t) => t.id !== id)); setSaved(false); };
  const toggleItem = (id) => { setDraft(draft.map((t) => (t.id === id ? { ...t, active: !t.active } : t))); setSaved(false); };

  const startEdit = (t) => { setEditingId(t.id); setEditForm({ name: t.name, role: t.role, text: t.text, photo: t.photo, stars: t.stars }); };
  const saveEdit = () => {
    setDraft(draft.map((t) => (t.id === editingId ? { ...t, ...editForm } : t)));
    setEditingId(null);
    setSaved(false);
  };

  const handlePhoto = async (file, target) => {
    if (!file || !file.type.startsWith('image/')) return;
    const dataUrl = await readFileAsDataURL(file);
    if (target === 'edit') setEditForm({ ...editForm, photo: dataUrl });
    else if (target === 'new') setNewForm({ ...newForm, photo: dataUrl });
  };

  const getInitials = (name) => name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  const StarSelect = ({ value, onChange }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} onClick={() => onChange(s)} className={`text-lg cursor-pointer transition-colors ${s <= value ? 'text-amber-400' : 'text-gray-300'}`}>★</button>
      ))}
    </div>
  );

  const TestimonialForm = ({ form, setForm, onSubmit, onCancel, photoTarget }) => (
    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome da pessoa" className={inputClass} />
        <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Cargo / Situação" className={inputClass} />
      </div>
      <textarea value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} placeholder="Texto do depoimento..." rows={2} className={inputClass} />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          {form.photo ? (
            <div className="relative">
              <img src={form.photo} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
              <button onClick={() => setForm({ ...form, photo: '' })} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[8px] flex items-center justify-center cursor-pointer">✕</button>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
              {form.name ? getInitials(form.name) : '?'}
            </div>
          )}
          <label className="text-xs text-indigo-600 cursor-pointer hover:text-indigo-800 font-medium">
            📷 {form.photo ? 'Trocar foto' : 'Upload foto'}
            <input type="file" accept="image/*" onChange={(e) => handlePhoto(e.target.files[0], photoTarget)} className="hidden" />
          </label>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Nota:</span>
          <StarSelect value={form.stars} onChange={(s) => setForm({ ...form, stars: s })} />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="text-xs text-gray-500 px-3 py-1.5 cursor-pointer">Cancelar</button>
        <button onClick={onSubmit} className="text-xs bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 cursor-pointer font-medium">Salvar</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-gray-900">Avaliações e Depoimentos</h3>
        <p className="text-xs text-gray-500 mt-0.5">Gerencie depoimentos exibidos na página inicial</p>
      </div>

      {/* Save bar */}
      <div className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
        saved ? 'bg-emerald-50 border-emerald-300' : hasChanges ? 'bg-amber-50 border-amber-300' : 'bg-gray-50 border-gray-200'
      }`}>
        <span className={`text-sm font-medium ${saved ? 'text-emerald-700' : hasChanges ? 'text-amber-700' : 'text-gray-500'}`}>
          {saved ? '✅ Salvo!' : hasChanges ? '⚠️ Alterações não salvas' : 'Configurações atualizadas'}
        </span>
        <div className="flex items-center gap-2">
          {hasChanges && <button onClick={handleDiscard} className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 cursor-pointer font-medium">Descartar</button>}
          <button onClick={handleSave} disabled={!hasChanges} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${hasChanges ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
            💾 Salvar
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-800">⭐ Depoimentos ({draft.length})</h4>
        <button onClick={() => setShowAdd(!showAdd)} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 cursor-pointer font-medium">+ Adicionar</button>
      </div>

      {showAdd && (
        <TestimonialForm form={newForm} setForm={setNewForm} onSubmit={addTestimonial} onCancel={() => setShowAdd(false)} photoTarget="new" />
      )}

      {/* List */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {draft.map((t) => (
          <div key={t.id}>
            {editingId === t.id ? (
              <TestimonialForm form={editForm} setForm={setEditForm} onSubmit={saveEdit} onCancel={() => setEditingId(null)} photoTarget="edit" />
            ) : (
              <div className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${t.active ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 overflow-hidden border border-gray-200">
                  {t.photo ? (
                    <img src={t.photo} alt={t.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-blue-600">{getInitials(t.name)}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-800 truncate">{t.name}</p>
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.stars }).map((_, i) => (
                        <span key={i} className="text-[10px] text-amber-400">★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400">{t.role}</p>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">"{t.text}"</p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => toggleItem(t.id)} className={`w-8 h-5 rounded-full transition-colors cursor-pointer ${t.active ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                    <div className={`w-3.5 h-3.5 bg-white rounded-full shadow transition-transform ${t.active ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                  </button>
                  <button onClick={() => startEdit(t)} className="text-gray-400 hover:text-indigo-600 cursor-pointer transition-colors p-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button onClick={() => deleteItem(t.id)} className="text-gray-400 hover:text-red-500 cursor-pointer transition-colors p-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Sticky save */}
      {hasChanges && (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
          <span className="text-sm text-amber-600 font-medium">⚠️ Alterações não salvas</span>
          <button onClick={handleSave} className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-md cursor-pointer transition-all">💾 Salvar</button>
        </div>
      )}
    </div>
  );
}
