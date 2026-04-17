import { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';

const ICONS = ['📨', '🎯', '📞', '✅', '🔥', '🚀', '💼', '🏆', '⭐', '👋', '💬', '📋'];

const firstNames = [
  'Carlos', 'Ana', 'João', 'Mariana', 'Pedro', 'Juliana', 'Rafael', 'Camila',
  'Lucas', 'Fernanda', 'Bruno', 'Beatriz', 'Thiago', 'Larissa', 'Diego',
  'Isabela', 'Gustavo', 'Patrícia', 'Mateus', 'Renata', 'Felipe', 'Amanda',
  'Leonardo', 'Gabriela', 'Vinícius', 'Letícia', 'André', 'Natália',
];
const states = ['SP', 'RJ', 'MG', 'BA', 'PR', 'RS', 'SC', 'PE', 'CE', 'DF', 'GO', 'PA', 'MA', 'ES'];
const jobTitles = [
  'Assistente Administrativo', 'Vendedor(a)', 'Recepcionista', 'Motorista',
  'Estoquista', 'Analista de Marketing', 'Desenvolvedor(a)', 'Atendente',
  'Auxiliar de Produção', 'Designer Gráfico', 'Enfermeiro(a)', 'Cozinheiro(a)',
];
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const aiTemplatesSimple = [
  '{name} de {state} enviou currículo agora',
  '{name} {initial}. se candidatou a {job}',
  '{name} de {state} criou um currículo',
  'Nova candidatura para {job}',
  '{name} {initial}. ativou o disparo automático',
  '{name} de {state} foi chamado(a) para entrevista',
  '{name} atualizou seu currículo',
  '{name} de {state} se cadastrou na plataforma',
  '{name} {initial}. enviou currículo para {job}',
  'Novo currículo cadastrado de {state}',
];
const aiTemplatesProfessional = [
  '{name} de {state} submeteu candidatura recentemente',
  '{name} {initial}. formalizou interesse na vaga de {job}',
  'Candidatura registrada para {job} em {state}',
  '{name} de {state} concluiu o cadastro profissional',
  '{name} {initial}. foi pré-selecionado(a) para entrevista',
  '{name} de {state} ativou envio automatizado de currículos',
  'Perfil profissional de {name} {initial}. atualizado',
  '{name} de {state} realizou nova candidatura',
  'Novo perfil cadastrado: {name} de {state}',
  '{name} {initial}. recebeu convite para processo seletivo',
];

function resolveTemplate(template) {
  return template
    .replace(/\{name\}/g, pick(firstNames))
    .replace(/\{initial\}/g, pick(firstNames).charAt(0))
    .replace(/\{state\}/g, pick(states))
    .replace(/\{job\}/g, pick(jobTitles));
}

const inputClass = 'w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow';

export default function SocialProofManager() {
  const { socialProofConfig, updateSocialProofConfig } = useAppContext();

  // Local draft — only commits to global on Save
  const [draft, setDraft] = useState(() => structuredClone(socialProofConfig));
  const [saved, setSaved] = useState(false);

  const { enabled, intervalMin, intervalMax, displayDuration, timeFormat, messages, noRepeat } = draft;

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ icon: '', template: '' });
  const [newForm, setNewForm] = useState({ icon: '📨', template: '' });
  const [showAdd, setShowAdd] = useState(false);
  const [genCount, setGenCount] = useState(10);
  const [genStyle, setGenStyle] = useState('simple');
  const [previewMsg, setPreviewMsg] = useState(null);

  const hasChanges = useMemo(() => JSON.stringify(draft) !== JSON.stringify(socialProofConfig), [draft, socialProofConfig]);

  const updateDraft = (updates) => {
    setDraft((prev) => ({ ...prev, ...updates }));
    setSaved(false);
  };
  const updateMessages = (updated) => updateDraft({ messages: updated });

  const nextId = () => Math.max(0, ...messages.map((m) => m.id)) + 1;

  const handleSave = () => {
    updateSocialProofConfig(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDiscard = () => {
    setDraft(structuredClone(socialProofConfig));
    setSaved(false);
  };

  const addMessage = () => {
    if (!newForm.template.trim()) return;
    updateMessages([...messages, { id: nextId(), icon: newForm.icon, template: newForm.template.trim(), active: true }]);
    setNewForm({ icon: '📨', template: '' });
    setShowAdd(false);
  };

  const deleteMessage = (id) => updateMessages(messages.filter((m) => m.id !== id));

  const toggleMessage = (id) =>
    updateMessages(messages.map((m) => (m.id === id ? { ...m, active: !m.active } : m)));

  const startEdit = (msg) => {
    setEditingId(msg.id);
    setEditForm({ icon: msg.icon, template: msg.template });
  };

  const saveEdit = () => {
    updateMessages(messages.map((m) => (m.id === editingId ? { ...m, icon: editForm.icon, template: editForm.template } : m)));
    setEditingId(null);
  };

  const generateMessages = () => {
    const pool = genStyle === 'professional' ? aiTemplatesProfessional : aiTemplatesSimple;
    const count = Math.min(genCount, 20);
    const generated = [];
    const usedTemplates = new Set();
    for (let i = 0; i < count; i++) {
      let t;
      let attempts = 0;
      do { t = pick(pool); attempts++; } while (usedTemplates.has(t) && attempts < pool.length * 2);
      usedTemplates.add(t);
      generated.push({ id: nextId() + i, icon: pick(ICONS), template: t, active: true });
    }
    updateMessages([...messages, ...generated]);
  };

  const showPreview = () => {
    const active = messages.filter((m) => m.active);
    if (active.length === 0) return;
    const msg = pick(active);
    setPreviewMsg({ icon: msg.icon, text: resolveTemplate(msg.template) });
    setTimeout(() => setPreviewMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Save bar */}
      <div className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
        saved ? 'bg-emerald-50 border-emerald-300' : hasChanges ? 'bg-amber-50 border-amber-300' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center gap-2">
          {saved ? (
            <span className="text-sm text-emerald-700 font-medium">✅ Configurações salvas com sucesso!</span>
          ) : hasChanges ? (
            <span className="text-sm text-amber-700 font-medium">⚠️ Alterações não salvas</span>
          ) : (
            <span className="text-sm text-gray-500">Configurações atualizadas</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <button onClick={handleDiscard} className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 cursor-pointer transition-colors font-medium">
              Descartar
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
              hasChanges
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            💾 Salvar alterações
          </button>
        </div>
      </div>

      {/* Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900">Notificações de Prova Social</h3>
          <p className="text-xs text-gray-500 mt-0.5">Exibe atividades recentes na landing page</p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className={`text-xs font-medium ${enabled ? 'text-emerald-600' : 'text-gray-400'}`}>
            {enabled ? 'Ativado' : 'Desativado'}
          </span>
          <button
            onClick={() => updateDraft({ enabled: !enabled })}
            className={`w-10 h-6 rounded-full transition-colors cursor-pointer ${enabled ? 'bg-emerald-500' : 'bg-gray-300'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-4.5' : 'translate-x-1'}`} />
          </button>
        </label>
      </div>

      {/* Timing */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-4">
        <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">⏱️ Controle de Tempo</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Intervalo mínimo (s)</label>
            <input
              type="number"
              value={intervalMin}
              onChange={(e) => updateDraft({ intervalMin: Math.max(5, Number(e.target.value)) })}
              min={5} max={120}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Intervalo máximo (s)</label>
            <input
              type="number"
              value={intervalMax}
              onChange={(e) => updateDraft({ intervalMax: Math.max(intervalMin + 1, Number(e.target.value)) })}
              min={10} max={300}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Duração na tela (s)</label>
            <input
              type="number"
              value={displayDuration}
              onChange={(e) => updateDraft({ displayDuration: Math.max(2, Math.min(15, Number(e.target.value))) })}
              min={2} max={15}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Time format */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">🕐 Formato de Tempo</h4>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'relative', label: 'há X minutos' },
            { value: 'now', label: 'agora mesmo' },
            { value: 'auto', label: 'automático (variação)' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateDraft({ timeFormat: opt.value })}
              className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                timeFormat === opt.value
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* No repeat */}
      <label className="flex items-center gap-3 cursor-pointer bg-gray-50 rounded-xl p-4">
        <input
          type="checkbox"
          checked={noRepeat}
          onChange={(e) => updateDraft({ noRepeat: e.target.checked })}
          className="w-4 h-4 rounded border-gray-300 text-indigo-600 cursor-pointer"
        />
        <div>
          <p className="text-sm font-medium text-gray-800">Não repetir mensagens seguidas</p>
          <p className="text-xs text-gray-500">Garante que a mesma notificação não apareça duas vezes consecutivas</p>
        </div>
      </label>

      {/* Messages list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            💬 Mensagens ({messages.length})
          </h4>
          <div className="flex items-center gap-2">
            <button onClick={showPreview} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer transition-colors">
              👁️ Preview
            </button>
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors font-medium"
            >
              + Adicionar
            </button>
          </div>
        </div>

        {/* Add form */}
        {showAdd && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-3 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="w-full sm:w-20">
                <label className="block text-xs font-medium text-gray-500 mb-1">Ícone</label>
                <select value={newForm.icon} onChange={(e) => setNewForm({ ...newForm, icon: e.target.value })} className={`${inputClass} text-center`}>
                  {ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Mensagem <span className="text-gray-400">(use {'{name}'}, {'{state}'}, {'{job}'}, {'{initial}'})</span>
                </label>
                <input
                  value={newForm.template}
                  onChange={(e) => setNewForm({ ...newForm, template: e.target.value })}
                  placeholder="{name} de {state} se candidatou a {job}"
                  className={inputClass}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAdd(false)} className="text-xs text-gray-500 px-3 py-1.5 cursor-pointer">Cancelar</button>
              <button onClick={addMessage} className="text-xs bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 cursor-pointer font-medium">Adicionar</button>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${msg.active ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
              {editingId === msg.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <select value={editForm.icon} onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })} className="w-14 px-1 py-1.5 rounded border border-gray-200 text-sm text-center cursor-pointer">
                    {ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                  <input
                    value={editForm.template}
                    onChange={(e) => setEditForm({ ...editForm, template: e.target.value })}
                    className="flex-1 px-2 py-1.5 rounded border border-gray-200 text-sm"
                  />
                  <button onClick={saveEdit} className="text-xs text-emerald-600 font-medium cursor-pointer">✓</button>
                  <button onClick={() => setEditingId(null)} className="text-xs text-gray-400 cursor-pointer">✕</button>
                </div>
              ) : (
                <>
                  <span className="text-base shrink-0">{msg.icon}</span>
                  <p className="text-xs text-gray-700 flex-1 min-w-0 truncate">{msg.template}</p>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => toggleMessage(msg.id)} className={`w-8 h-5 rounded-full transition-colors cursor-pointer ${msg.active ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                      <div className={`w-3.5 h-3.5 bg-white rounded-full shadow transition-transform ${msg.active ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                    </button>
                    <button onClick={() => startEdit(msg)} className="text-gray-400 hover:text-indigo-600 cursor-pointer transition-colors p-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button onClick={() => deleteMessage(msg.id)} className="text-gray-400 hover:text-red-500 cursor-pointer transition-colors p-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          {messages.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-6">Nenhuma mensagem cadastrada</p>
          )}
        </div>
      </div>

      {/* AI Generator */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-5 space-y-4">
        <div>
          <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">🤖 Gerador Automático de Mensagens</h4>
          <p className="text-xs text-gray-500 mt-0.5">Gere mensagens realistas automaticamente</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Quantidade</label>
            <input
              type="number"
              value={genCount}
              onChange={(e) => setGenCount(Math.max(1, Math.min(20, Number(e.target.value))))}
              min={1} max={20}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Estilo</label>
            <select value={genStyle} onChange={(e) => setGenStyle(e.target.value)} className={`${inputClass} cursor-pointer appearance-none`}>
              <option value="simple">Simples</option>
              <option value="professional">Profissional</option>
            </select>
          </div>
        </div>
        <button
          onClick={generateMessages}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:from-indigo-700 hover:to-purple-700 transition-all cursor-pointer hover:shadow-lg"
        >
          ✨ Gerar {genCount} mensagens
        </button>
      </div>

      {/* Bottom save bar (sticky) */}
      {hasChanges && (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between shadow-[0_-4px_12px_rgba(0,0,0,0.06)] rounded-b-2xl">
          <span className="text-sm text-amber-600 font-medium">⚠️ Você tem alterações não salvas</span>
          <div className="flex items-center gap-2">
            <button onClick={handleDiscard} className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 cursor-pointer font-medium">
              Descartar
            </button>
            <button
              onClick={handleSave}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-md cursor-pointer transition-all"
            >
              💾 Salvar alterações
            </button>
          </div>
        </div>
      )}

      {/* Preview toast */}
      {previewMsg && (
        <div className="fixed bottom-6 left-6 z-50 animate-[slideUp_0.3s_ease-out]">
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 flex items-center gap-3 max-w-xs">
            <span className="text-lg shrink-0">{previewMsg.icon}</span>
            <div className="min-w-0">
              <p className="text-sm text-gray-700 leading-snug">{previewMsg.text}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">há 3 minutos</p>
            </div>
          </div>
          <style>{`@keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
      )}
    </div>
  );
}
