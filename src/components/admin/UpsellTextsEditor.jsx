import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';

const fields = [
  { key: 'sendLimitTitle', label: 'Título — Limite de envios', type: 'input' },
  { key: 'sendLimitText', label: 'Texto — Limite de envios', type: 'textarea' },
  { key: 'dispatchLockedTitle', label: 'Título — Disparador bloqueado', type: 'input' },
  { key: 'dispatchLockedText', label: 'Texto — Disparador bloqueado', type: 'textarea' },
  { key: 'dispatchLimitTitle', label: 'Título — Limite diário de disparos', type: 'input' },
  { key: 'dispatchLimitText', label: 'Texto — Limite diário de disparos', type: 'textarea' },
];

export default function UpsellTextsEditor() {
  const { upsellTexts, updateUpsellTexts } = useAppContext();
  const [texts, setTexts] = useState({ ...upsellTexts });
  const [saved, setSaved] = useState(false);

  const handleChange = (key, value) => {
    setTexts((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    updateUpsellTexts(texts);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputClass = 'w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none';

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Textos de Upsell e Bloqueio</h3>
        <p className="text-sm text-gray-500 mt-1">Personalize as mensagens exibidas aos usuários.</p>
      </div>

      <div className="space-y-5">
        {fields.map(({ key, label, type }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
            {type === 'textarea' ? (
              <textarea
                value={texts[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                rows={2}
                className={`${inputClass} resize-none`}
              />
            ) : (
              <input
                value={texts[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                className={inputClass}
              />
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
          saved ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }`}
      >
        {saved ? '✓ Salvo com sucesso!' : 'Salvar alterações'}
      </button>
    </div>
  );
}
