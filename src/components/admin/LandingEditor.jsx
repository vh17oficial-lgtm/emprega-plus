import { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import Button from '../common/Button';

export default function LandingEditor() {
  const { landingTexts, updateLandingTexts } = useAppContext();
  const [form, setForm] = useState(landingTexts);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(landingTexts);
  }, [landingTexts]);

  const handleChange = async (e) => {
    const updated = { ...form, [e.target.name]: e.target.value };
    setForm(updated);
    await updateLandingTexts(updated);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const fields = [
    { name: 'heroTitle', label: 'Título Principal (Hero)' },
    { name: 'heroSubtitle', label: 'Subtítulo (Hero)' },
    { name: 'step1Title', label: 'Passo 1 — Título' },
    { name: 'step1Desc', label: 'Passo 1 — Descrição' },
    { name: 'step2Title', label: 'Passo 2 — Título' },
    { name: 'step2Desc', label: 'Passo 2 — Descrição' },
    { name: 'step3Title', label: 'Passo 3 — Título' },
    { name: 'step3Desc', label: 'Passo 3 — Descrição' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Editar Landing Page</h3>
        <p className="text-sm text-gray-500">As alterações são refletidas em tempo real na página inicial.</p>
      </div>

      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            {field.name.includes('Desc') || field.name.includes('Subtitle') || field.name === 'heroSubtitle' ? (
              <textarea
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
              />
            ) : (
              <input
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            )}
          </div>
        ))}
      </div>

      <Button onClick={handleSave} variant="success">
        {saved ? '✓ Salvo com sucesso!' : '💾 Salvar Alterações'}
      </Button>
    </div>
  );
}
