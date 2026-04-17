import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';

export default function DispatcherConfig() {
  const { autoDispatchConfig, updateAutoDispatchConfig } = useAppContext();
  const [config, setConfig] = useState({ ...autoDispatchConfig, upgrades: autoDispatchConfig.upgrades.map((u) => ({ ...u })) });
  const [saved, setSaved] = useState(false);

  const handleBaseChange = (field, value) => {
    setConfig((prev) => ({ ...prev, [field]: parseFloat(value) || 0 }));
    setSaved(false);
  };

  const handleUpgradeChange = (idx, field, value) => {
    const updated = { ...config, upgrades: config.upgrades.map((u, i) => (i === idx ? { ...u, [field]: field === 'price' || field === 'amount' ? parseFloat(value) || 0 : value } : u)) };
    setConfig(updated);
    setSaved(false);
  };

  const handleSave = () => {
    updateAutoDispatchConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputClass = 'w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none';

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Configuração do Disparador</h3>
        <p className="text-sm text-gray-500 mt-1">Configure preços e limites do disparo automático.</p>
      </div>

      {/* Base config */}
      <div className="bg-purple-50 border border-purple-100 rounded-xl p-5">
        <h4 className="text-sm font-semibold text-purple-900 mb-4 flex items-center gap-2">
          <span>⚡</span> Plano Base do Disparador
        </h4>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Preço base (R$)</label>
            <input
              type="number"
              value={config.basePrice}
              onChange={(e) => handleBaseChange('basePrice', e.target.value)}
              step={0.01}
              min={0}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Limite diário inicial</label>
            <input
              type="number"
              value={config.initialDailyLimit}
              onChange={(e) => handleBaseChange('initialDailyLimit', e.target.value)}
              min={1}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Upgrades */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Opções de Upgrade</h4>
        <div className="space-y-3">
          {config.upgrades.map((upgrade, idx) => (
            <div key={upgrade.id} className="border border-gray-200 rounded-xl p-4 bg-white">
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Nome</label>
                  <input
                    value={upgrade.label}
                    onChange={(e) => handleUpgradeChange(idx, 'label', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Disparos {upgrade.amount === -1 ? '(ilimitado)' : '(quantidade)'}
                  </label>
                  <input
                    type="number"
                    value={upgrade.amount}
                    onChange={(e) => handleUpgradeChange(idx, 'amount', e.target.value)}
                    className={inputClass}
                    disabled={upgrade.amount === -1}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Preço (R$)</label>
                  <input
                    type="number"
                    value={upgrade.price}
                    onChange={(e) => handleUpgradeChange(idx, 'price', e.target.value)}
                    step={0.01}
                    min={0}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
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
