import { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';

const inputClass = 'w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow';
const THUMBS = [
  { value: 'gradient-indigo', label: 'Indigo', color: 'bg-gradient-to-br from-indigo-600 to-purple-700' },
  { value: 'gradient-purple', label: 'Roxo', color: 'bg-gradient-to-br from-purple-600 to-rose-700' },
  { value: 'gradient-emerald', label: 'Verde', color: 'bg-gradient-to-br from-emerald-600 to-teal-700' },
  { value: 'gradient-orange', label: 'Laranja', color: 'bg-gradient-to-br from-orange-500 to-rose-600' },
];
const ICONS = ['📝', '💬', '🎥', '🎓', '💼', '🚀', '⭐', '🎯'];

const emptyForm = { title: '', duration: '', url: '', icon: '🎥', thumb: 'gradient-indigo' };

function getThumbClass(t) {
  const match = THUMBS.find((th) => th.value === t);
  return match?.color || THUMBS[0].color;
}

function isYouTubeUrl(url) {
  return /youtube\.com|youtu\.be/.test(url);
}

function getYouTubeEmbedUrl(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export default function VideoManager() {
  const { landingVideos, updateLandingVideos } = useAppContext();

  const [draft, setDraft] = useState(() => structuredClone(landingVideos));
  const [saved, setSaved] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [showAdd, setShowAdd] = useState(false);
  const [newForm, setNewForm] = useState(emptyForm);

  const hasChanges = useMemo(() => JSON.stringify(draft) !== JSON.stringify(landingVideos), [draft, landingVideos]);

  const handleSave = async () => { await updateLandingVideos(draft); setSaved(true); setTimeout(() => setSaved(false), 3000); };
  const handleDiscard = () => { setDraft(structuredClone(landingVideos)); setSaved(false); };
  const nextId = () => Math.max(0, ...draft.map((v) => v.id)) + 1;

  const addVideo = () => {
    if (!newForm.title.trim()) return;
    setDraft([...draft, { ...newForm, id: nextId(), active: true }]);
    setNewForm(emptyForm);
    setShowAdd(false);
    setSaved(false);
  };

  const deleteItem = (id) => { if (!confirm('Tem certeza que deseja excluir este vídeo?')) return; setDraft(draft.filter((v) => v.id !== id)); setSaved(false); };
  const toggleItem = (id) => { setDraft(draft.map((v) => (v.id === id ? { ...v, active: !v.active } : v))); setSaved(false); };

  const startEdit = (v) => { setEditingId(v.id); setEditForm({ title: v.title, duration: v.duration, url: v.url || '', icon: v.icon, thumb: v.thumb }); };
  const saveEdit = () => {
    setDraft(draft.map((v) => (v.id === editingId ? { ...v, ...editForm } : v)));
    setEditingId(null);
    setSaved(false);
  };

  const VideoForm = ({ form, setForm, onSubmit, onCancel }) => (
    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-3">
      <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Título do vídeo" className={inputClass} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="URL do vídeo (YouTube, etc) — opcional" className={inputClass} />
        <input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="Duração (ex: 2:15)" className={inputClass} />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <p className="text-xs text-gray-500 mb-1.5">Ícone</p>
          <div className="flex gap-1">
            {ICONS.map((ic) => (
              <button key={ic} onClick={() => setForm({ ...form, icon: ic })} className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center cursor-pointer transition-all ${form.icon === ic ? 'bg-indigo-600 shadow-md scale-110' : 'bg-white border border-gray-200 hover:border-indigo-300'}`}>{ic}</button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1.5">Cor do thumbnail</p>
          <div className="flex gap-1.5">
            {THUMBS.map((th) => (
              <button key={th.value} onClick={() => setForm({ ...form, thumb: th.value })} className={`w-8 h-8 rounded-lg ${th.color} cursor-pointer transition-all ${form.thumb === th.value ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110' : 'opacity-70 hover:opacity-100'}`} title={th.label} />
            ))}
          </div>
        </div>
      </div>
      {form.url && isYouTubeUrl(form.url) && (
        <div className="bg-white rounded-lg border border-gray-200 p-2">
          <p className="text-[10px] text-gray-400 mb-1">Preview do YouTube</p>
          <div className="aspect-video rounded overflow-hidden bg-gray-900">
            <iframe src={getYouTubeEmbedUrl(form.url)} className="w-full h-full" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope" allowFullScreen title="preview" />
          </div>
        </div>
      )}
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="text-xs text-gray-500 px-3 py-1.5 cursor-pointer">Cancelar</button>
        <button onClick={onSubmit} className="text-xs bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 cursor-pointer font-medium">Salvar</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-gray-900">Vídeos da Página Inicial</h3>
        <p className="text-xs text-gray-500 mt-0.5">Gerencie vídeos exibidos na seção "Veja na prática"</p>
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

      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-800">🎥 Vídeos ({draft.length})</h4>
        <button onClick={() => setShowAdd(!showAdd)} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 cursor-pointer font-medium">+ Adicionar</button>
      </div>

      {showAdd && <VideoForm form={newForm} setForm={setNewForm} onSubmit={addVideo} onCancel={() => setShowAdd(false)} />}

      {/* List */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {draft.map((v) => (
          <div key={v.id}>
            {editingId === v.id ? (
              <VideoForm form={editForm} setForm={setEditForm} onSubmit={saveEdit} onCancel={() => setEditingId(null)} />
            ) : (
              <div className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${v.active ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                {/* Thumbnail */}
                <div className={`w-16 h-10 rounded-lg ${getThumbClass(v.thumb)} flex items-center justify-center shrink-0 relative overflow-hidden`}>
                  <span className="text-lg relative z-10">{v.icon}</span>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{v.title}</p>
                  <p className="text-[10px] text-gray-400">
                    {v.duration && `⏱ ${v.duration}`}
                    {v.url ? ' • 🔗 Com link' : ' • 📌 Sem link'}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => toggleItem(v.id)} className={`w-8 h-5 rounded-full transition-colors cursor-pointer ${v.active ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                    <div className={`w-3.5 h-3.5 bg-white rounded-full shadow transition-transform ${v.active ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                  </button>
                  <button onClick={() => startEdit(v)} className="text-gray-400 hover:text-indigo-600 cursor-pointer transition-colors p-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button onClick={() => deleteItem(v.id)} className="text-gray-400 hover:text-red-500 cursor-pointer transition-colors p-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {draft.length === 0 && <p className="text-xs text-gray-400 text-center py-6">Nenhum vídeo cadastrado</p>}
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
