import { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { cacheBust } from '../../utils/cacheBust';

const inputClass = 'w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow';

function readFileAsDataURL(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}

export default function CompanyManager() {
  const { companies, updateCompanies } = useAppContext();

  const [draft, setDraft] = useState(() => structuredClone(companies));
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', logo: '' });
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [search, setSearch] = useState('');

  // Keep draft in sync when companies reloads from DB (after save returns new ids)
  useEffect(() => { setDraft(structuredClone(companies)); }, [companies]);

  const hasChanges = useMemo(() => JSON.stringify(draft) !== JSON.stringify(companies), [draft, companies]);

  const filtered = useMemo(() => {
    if (!search.trim()) return draft;
    const q = search.toLowerCase();
    return draft.filter(c => c.name.toLowerCase().includes(q));
  }, [draft, search]);

  const withLogo = draft.filter(c => c.logo).length;
  const activeCount = draft.filter(c => c.active).length;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateCompanies(draft);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };
  const handleDiscard = () => { setDraft(structuredClone(companies)); setSaved(false); };

  const nextId = () => Math.max(0, ...draft.map((c) => c.id)) + 1;

  const addCompany = () => {
    if (!newName.trim()) return;
    setDraft([...draft, { id: nextId(), name: newName.trim(), logo: '', active: true }]);
    setNewName('');
    setShowAdd(false);
    setSaved(false);
  };

  const deleteCompany = (id) => { if (!confirm('Tem certeza que deseja excluir esta empresa?')) return; setDraft(draft.filter((c) => c.id !== id)); setSaved(false); };
  const toggleCompany = (id) => { setDraft(draft.map((c) => (c.id === id ? { ...c, active: !c.active } : c))); setSaved(false); };

  const startEdit = (c) => { setEditingId(c.id); setEditForm({ name: c.name, logo: c.logo }); };
  const saveEdit = () => {
    setDraft(draft.map((c) => (c.id === editingId ? { ...c, name: editForm.name, logo: editForm.logo } : c)));
    setEditingId(null);
    setSaved(false);
  };

  const handleLogoUpload = async (id, file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const dataUrl = await readFileAsDataURL(file);
    if (editingId === id) {
      setEditForm({ ...editForm, logo: dataUrl });
    } else {
      setDraft(draft.map((c) => (c.id === id ? { ...c, logo: dataUrl } : c)));
      setSaved(false);
    }
  };

  const removeLogo = (id) => {
    if (editingId === id) {
      setEditForm({ ...editForm, logo: '' });
    } else {
      setDraft(draft.map((c) => (c.id === id ? { ...c, logo: '' } : c)));
      setSaved(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-gray-900">Gestão de Empresas</h3>
        <p className="text-xs text-gray-500 mt-0.5">Gerencie logos exibidos na faixa de marcas e nas vagas. Ao trocar o logo aqui, ele atualiza em todo o site.</p>
      </div>

      {/* Save bar */}
      <div className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
        saved ? 'bg-emerald-50 border-emerald-300' : hasChanges ? 'bg-amber-50 border-amber-300' : 'bg-gray-50 border-gray-200'
      }`}>
        <span className={`text-sm font-medium ${saved ? 'text-emerald-700' : hasChanges ? 'text-amber-700' : 'text-gray-500'}`}>
          {saved ? '✅ Salvo com sucesso!' : hasChanges ? '⚠️ Alterações não salvas' : 'Configurações atualizadas'}
        </span>
        <div className="flex items-center gap-2">
          {hasChanges && <button onClick={handleDiscard} className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 cursor-pointer font-medium">Descartar</button>}
          <button onClick={handleSave} disabled={saving} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${saving ? 'bg-gray-300 text-gray-500 cursor-wait' : hasChanges ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md' : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md'}`}>
            {saving ? '⏳ Salvando...' : hasChanges ? '💾 Salvar' : '✓ Tudo salvo'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-gray-800">{draft.length}</p>
          <p className="text-[10px] text-gray-500">Total</p>
        </div>
        <div className="bg-emerald-50 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-emerald-700">{activeCount}</p>
          <p className="text-[10px] text-gray-500">Ativas</p>
        </div>
        <div className="bg-indigo-50 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-indigo-700">{withLogo}</p>
          <p className="text-[10px] text-gray-500">Com logo</p>
        </div>
      </div>

      {/* Add + Search */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Buscar empresa..."
            className={inputClass}
          />
        </div>
        <h4 className="text-sm font-semibold text-gray-800 whitespace-nowrap">🏢 ({filtered.length})</h4>
        <button onClick={() => setShowAdd(!showAdd)} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 cursor-pointer font-medium whitespace-nowrap">+ Adicionar</button>
      </div>

      {showAdd && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-3">
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nome da empresa" className={inputClass} />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="text-xs text-gray-500 px-3 py-1.5 cursor-pointer">Cancelar</button>
            <button onClick={addCompany} className="text-xs bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 cursor-pointer font-medium">Adicionar</button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {filtered.map((c) => (
          <div key={c.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${c.active ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
            {editingId === c.id ? (
              <div className="flex-1 space-y-3">
                <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className={inputClass} />
                <div className="flex items-center gap-3">
                  {editForm.logo ? (
                    <div className="relative">
                      <img src={cacheBust(editForm.logo)} alt="" className="w-12 h-12 rounded-lg object-contain bg-gray-50 border border-gray-200" />
                      <button onClick={() => removeLogo(c.id)} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[8px] flex items-center justify-center cursor-pointer">✕</button>
                    </div>
                  ) : (
                    <label className="w-12 h-12 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs cursor-pointer hover:border-indigo-400 transition-colors">
                      📷
                      <input type="file" accept="image/*" onChange={(e) => handleLogoUpload(c.id, e.target.files[0])} className="hidden" />
                    </label>
                  )}
                  <label className="text-xs text-indigo-600 cursor-pointer hover:text-indigo-800 font-medium">
                    {editForm.logo ? 'Trocar logo' : 'Upload logo'}
                    <input type="file" accept="image/*" onChange={(e) => handleLogoUpload(c.id, e.target.files[0])} className="hidden" />
                  </label>
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setEditingId(null)} className="text-xs text-gray-400 cursor-pointer">Cancelar</button>
                  <button onClick={saveEdit} className="text-xs text-emerald-600 font-medium cursor-pointer">✓ Salvar</button>
                </div>
              </div>
            ) : (
              <>
                {/* Logo / fallback */}
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden border border-gray-200">
                  {c.logo ? (
                    <img src={cacheBust(c.logo)} alt={c.name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-sm font-bold text-gray-400">{c.name.charAt(0)}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{c.name}</p>
                  <p className="text-[10px] text-gray-400">{c.logo ? '✅ Com logo' : '⚠️ Sem logo'}</p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => toggleCompany(c.id)} className={`w-8 h-5 rounded-full transition-colors cursor-pointer ${c.active ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                    <div className={`w-3.5 h-3.5 bg-white rounded-full shadow transition-transform ${c.active ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                  </button>
                  <button onClick={() => startEdit(c)} className="text-gray-400 hover:text-indigo-600 cursor-pointer transition-colors p-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button onClick={() => deleteCompany(c.id)} className="text-gray-400 hover:text-red-500 cursor-pointer transition-colors p-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Sticky bottom save */}
      {hasChanges && (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
          <span className="text-sm text-amber-600 font-medium">⚠️ Alterações não salvas</span>
          <button onClick={handleSave} className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-md cursor-pointer transition-all">💾 Salvar</button>
        </div>
      )}
    </div>
  );
}
