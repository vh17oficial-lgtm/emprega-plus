import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';

export default function PlansManager() {
  const { sendPlans, updateSendPlans, siteConfig, updateSiteConfig } = useAppContext();
  const [plans, setPlans] = useState(sendPlans.map((p) => ({ ...p })));
  const [saved, setSaved] = useState(false);

  const handleChange = (idx, field, value) => {
    const updated = [...plans];
    if (field === 'price' || field === 'credits') {
      updated[idx][field] = parseFloat(value) || 0;
    } else if (field === 'active' || field === 'popular') {
      updated[idx][field] = !updated[idx][field];
    } else {
      updated[idx][field] = value;
    }
    setPlans(updated);
    setSaved(false);
  };

  const handleSave = async () => {
    await updateSendPlans(plans);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const [upsellSaved, setUpsellSaved] = useState(false);
  const updateUpsellPrice = async (plan, field, value) => {
    await updateSiteConfig({ [plan]: { ...siteConfig[plan], [field]: value } });
    setUpsellSaved(true);
    setTimeout(() => setUpsellSaved(false), 1500);
  };

  const inputClass = 'w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none';

  return (
    <div className="space-y-6">
      {/* Upsell Prices */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">💰 Preços dos Upsells {upsellSaved && <span className="text-xs text-green-600 font-normal ml-2">✓ Salvo</span>}</h3>
        <p className="text-sm text-gray-500 mb-4">Configure os preços dos produtos premium da plataforma.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* PDF Download Price */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">📄</span>
              <div>
                <p className="text-sm font-bold text-gray-900">Download PDF</p>
                <p className="text-xs text-gray-500">Preço para baixar currículo em PDF</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">R$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={siteConfig.pdfDownloadPlan?.price ?? 12.90}
                onChange={(e) => updateUpsellPrice('pdfDownloadPlan', 'price', parseFloat(e.target.value) || 0)}
                className="w-28 px-3 py-2 rounded-lg border border-gray-300 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Priority Resume Price */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">💎</span>
              <div>
                <p className="text-sm font-bold text-gray-900">Currículo Prioritário</p>
                <p className="text-xs text-gray-500">Preço para destaque de currículo</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">R$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={siteConfig.priorityPlan?.price ?? 9.99}
                onChange={(e) => updateUpsellPrice('priorityPlan', 'price', parseFloat(e.target.value) || 0)}
                className="w-28 px-3 py-2 rounded-lg border border-gray-300 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Send Plans */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">📦 Planos de Envio de Currículo</h3>
        <p className="text-sm text-gray-500 mt-1">Configure os pacotes de créditos disponíveis para os usuários.</p>
      </div>

      <div className="space-y-4">
        {plans.map((plan, idx) => (
          <div key={plan.id} className={`border rounded-xl p-5 transition-colors ${plan.active ? 'border-gray-200 bg-white' : 'border-gray-200 bg-gray-50 opacity-60'}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <span className="text-lg">📦</span>
                </div>
                <div>
                  <input
                    value={plan.name}
                    onChange={(e) => handleChange(idx, 'name', e.target.value)}
                    className="font-semibold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-indigo-500 outline-none px-0 py-0.5 text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                  <span>Popular</span>
                  <button
                    type="button"
                    onClick={() => handleChange(idx, 'popular', !plan.popular)}
                    className={`w-8 h-5 rounded-full transition-colors cursor-pointer ${plan.popular ? 'bg-yellow-500' : 'bg-gray-300'}`}
                  >
                    <div className={`w-3.5 h-3.5 bg-white rounded-full shadow transition-transform ${plan.popular ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                  </button>
                </label>
                <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                  <span>Ativo</span>
                  <button
                    type="button"
                    onClick={() => handleChange(idx, 'active', !plan.active)}
                    className={`w-8 h-5 rounded-full transition-colors cursor-pointer ${plan.active ? 'bg-emerald-500' : 'bg-gray-300'}`}
                  >
                    <div className={`w-3.5 h-3.5 bg-white rounded-full shadow transition-transform ${plan.active ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                  </button>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Créditos (envios)</label>
                <input
                  type="number"
                  value={plan.credits}
                  onChange={(e) => handleChange(idx, 'credits', e.target.value)}
                  min={1}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Preço (R$)</label>
                <input
                  type="number"
                  value={plan.price}
                  onChange={(e) => handleChange(idx, 'price', e.target.value)}
                  min={0}
                  step={0.01}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
          saved
            ? 'bg-emerald-600 text-white'
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }`}
      >
        {saved ? '✓ Salvo com sucesso!' : 'Salvar alterações'}
      </button>
    </div>
  );
}
