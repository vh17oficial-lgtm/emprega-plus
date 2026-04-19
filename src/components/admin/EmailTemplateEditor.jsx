import { useAppContext } from '../../context/AppContext';

const TEMPLATES = [
  { key: 'welcome', label: '👋 Boas-vindas', description: 'Mensagem exibida após primeiro login' },
  { key: 'jobApplied', label: '📨 Candidatura Enviada', description: 'Após candidatar-se a uma vaga' },
  { key: 'jobAccepted', label: '✅ Pré-selecionado', description: 'Quando empresa pré-seleciona' },
  { key: 'creditsLow', label: '💰 Créditos Baixos', description: 'Quando créditos estão acabando' },
];

const DEFAULTS = {
  welcome: 'Bem-vindo(a) ao Emprega+! 🎉\nSeu perfil foi criado com sucesso. Comece criando seu currículo profissional.',
  jobApplied: 'Sua candidatura foi enviada com sucesso! ✅\nA empresa será notificada e você pode acompanhar o status na aba "Minhas Candidaturas".',
  jobAccepted: 'Parabéns! 🎊 Você foi pré-selecionado(a)!\nA empresa demonstrou interesse no seu perfil. Fique atento ao contato.',
  creditsLow: 'Seus créditos de envio estão acabando! ⚠️\nAdquira mais créditos para continuar se candidatando.',
};

export default function EmailTemplateEditor() {
  const { siteConfig, updateSiteConfig } = useAppContext();
  const templates = siteConfig.emailTemplates || {};

  const update = (key, value) => {
    updateSiteConfig({ emailTemplates: { ...templates, [key]: value } });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">✉️ Templates de Notificação</h3>
        <p className="text-sm text-gray-500 mt-1">Personalize as mensagens exibidas aos usuários.</p>
      </div>

      <div className="space-y-4">
        {TEMPLATES.map((t) => (
          <div key={t.key} className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-semibold text-gray-800">{t.label}</p>
                <p className="text-xs text-gray-500">{t.description}</p>
              </div>
              <button
                onClick={() => update(t.key, DEFAULTS[t.key])}
                className="text-xs text-indigo-600 hover:text-indigo-700 cursor-pointer"
              >
                Restaurar padrão
              </button>
            </div>
            <textarea
              value={templates[t.key] ?? DEFAULTS[t.key]}
              onChange={(e) => update(t.key, e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
