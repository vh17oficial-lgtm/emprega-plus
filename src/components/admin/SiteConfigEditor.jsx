import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';

function Field({ label, value, onChange, multiline, small }) {
  const cls = 'w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow';
  return (
    <div className={small ? '' : 'mb-4'}>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className={cls} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className={cls} />
      )}
    </div>
  );
}

function Section({ title, icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
      >
        <span className="text-sm font-bold text-gray-800 flex items-center gap-2">{icon} {title}</span>
        <svg className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="p-5 space-y-3">{children}</div>}
    </div>
  );
}

export default function SiteConfigEditor() {
  const { siteConfig, updateSiteConfig } = useAppContext();
  const [saved, setSaved] = useState(false);

  const update = async (key, value) => {
    await updateSiteConfig({ [key]: value });
    flash();
  };

  const updateNested = async (parent, key, value) => {
    await updateSiteConfig({ [parent]: { ...siteConfig[parent], [key]: value } });
    flash();
  };

  const flash = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-lg font-bold text-gray-900">⚙️ Configurações do Site</h2>
          <p className="text-xs text-gray-500">Alterações refletem em tempo real no sistema</p>
        </div>
        {saved && (
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg animate-pulse">
            ✅ Salvo
          </span>
        )}
      </div>

      {/* Platform Identity */}
      <Section title="Identidade da Plataforma" icon="🏷️" defaultOpen>
        <Field label="Nome da plataforma" value={siteConfig.platformName} onChange={(v) => update('platformName', v)} />
        <Field label="Tagline" value={siteConfig.platformTagline} onChange={(v) => update('platformTagline', v)} multiline />
        <Field label="Badge do hero" value={siteConfig.platformBadge} onChange={(v) => update('platformBadge', v)} />
      </Section>

      {/* Hero Stats */}
      <Section title="Estatísticas do Hero" icon="📊">
        {siteConfig.heroStats.map((stat, i) => (
          <div key={i} className="flex gap-3 items-end">
            <div className="flex-1">
              <Field label={`Valor #${i + 1}`} value={stat.value} small onChange={(v) => {
                const updated = [...siteConfig.heroStats];
                updated[i] = { ...updated[i], value: v };
                update('heroStats', updated);
              }} />
            </div>
            <div className="flex-1">
              <Field label={`Label #${i + 1}`} value={stat.label} small onChange={(v) => {
                const updated = [...siteConfig.heroStats];
                updated[i] = { ...updated[i], label: v };
                update('heroStats', updated);
              }} />
            </div>
          </div>
        ))}
      </Section>

      {/* Hero CTA */}
      <Section title="Botões do Hero" icon="🔘">
        <Field label="Botão principal" value={siteConfig.heroCta} onChange={(v) => update('heroCta', v)} />
        <Field label="Botão secundário" value={siteConfig.heroCtaSecondary} onChange={(v) => update('heroCtaSecondary', v)} />
        <Field label="Botão terciário" value={siteConfig.heroCtaTertiary} onChange={(v) => update('heroCtaTertiary', v)} />
      </Section>

      {/* How It Works */}
      <Section title="Seção Como Funciona" icon="📋">
        <Field label="Tag" value={siteConfig.howItWorksTag} onChange={(v) => update('howItWorksTag', v)} />
        <Field label="Título" value={siteConfig.howItWorksTitle} onChange={(v) => update('howItWorksTitle', v)} />
        <Field label="Subtítulo" value={siteConfig.howItWorksSubtitle} onChange={(v) => update('howItWorksSubtitle', v)} multiline />
      </Section>

      {/* Featured Jobs */}
      <Section title="Seção Vagas em Destaque" icon="⭐">
        <Field label="Tag" value={siteConfig.featuredTag} onChange={(v) => update('featuredTag', v)} />
        <Field label="Título" value={siteConfig.featuredTitle} onChange={(v) => update('featuredTitle', v)} />
        <Field label="Subtítulo" value={siteConfig.featuredSubtitle} onChange={(v) => update('featuredSubtitle', v)} />
        <Field label="Texto do botão" value={siteConfig.featuredCta} onChange={(v) => update('featuredCta', v)} />
      </Section>

      {/* Footer */}
      <Section title="Rodapé" icon="📄">
        <Field label="Descrição do rodapé" value={siteConfig.footerDescription} onChange={(v) => update('footerDescription', v)} multiline />
      </Section>

      {/* Onboarding */}
      <Section title="Onboarding (Checklist)" icon="🎯">
        <Field label="Título do checklist" value={siteConfig.onboardingTitle} onChange={(v) => update('onboardingTitle', v)} />
        <Field label="Subtítulo" value={siteConfig.onboardingSubtitle} onChange={(v) => update('onboardingSubtitle', v)} />
        {siteConfig.onboardingSteps.map((step, i) => (
          <div key={i} className="bg-gray-50 rounded-lg p-3 space-y-2">
            <p className="text-xs font-bold text-gray-500">Passo {i + 1}</p>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Ícone" small value={step.icon} onChange={(v) => {
                const updated = [...siteConfig.onboardingSteps];
                updated[i] = { ...updated[i], icon: v };
                update('onboardingSteps', updated);
              }} />
              <Field label="Label" small value={step.label} onChange={(v) => {
                const updated = [...siteConfig.onboardingSteps];
                updated[i] = { ...updated[i], label: v };
                update('onboardingSteps', updated);
              }} />
            </div>
            <Field label="Descrição" small value={step.description} onChange={(v) => {
              const updated = [...siteConfig.onboardingSteps];
              updated[i] = { ...updated[i], description: v };
              update('onboardingSteps', updated);
            }} />
          </div>
        ))}
      </Section>

      {/* Application Modal */}
      <Section title="Modal de Candidatura" icon="📨">
        <Field label="Título de sucesso" value={siteConfig.applicationSuccessTitle} onChange={(v) => update('applicationSuccessTitle', v)} />
        <Field label="Mensagem de sucesso" value={siteConfig.applicationSuccessText} onChange={(v) => update('applicationSuccessText', v)} multiline />
        {siteConfig.applicationSteps.map((step, i) => (
          <div key={i} className="flex gap-2 items-end">
            <div className="w-16">
              <Field label="Ícone" small value={step.icon} onChange={(v) => {
                const updated = [...siteConfig.applicationSteps];
                updated[i] = { ...updated[i], icon: v };
                update('applicationSteps', updated);
              }} />
            </div>
            <div className="flex-1">
              <Field label={`Etapa ${i + 1}`} small value={step.text} onChange={(v) => {
                const updated = [...siteConfig.applicationSteps];
                updated[i] = { ...updated[i], text: v };
                update('applicationSteps', updated);
              }} />
            </div>
          </div>
        ))}
      </Section>

      {/* System Messages */}
      <Section title="Mensagens do Sistema" icon="💬">
        {Object.entries(siteConfig.messages).map(([key, val]) => (
          <Field
            key={key}
            label={key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
            value={val}
            onChange={(v) => updateNested('messages', key, v)}
            multiline={val.length > 60}
          />
        ))}
      </Section>

      {/* Priority Plan */}
      <Section title="Plano Currículo em Destaque" icon="💎">
        <Field label="Nome do plano" value={siteConfig.priorityPlan.name} onChange={(v) => updateNested('priorityPlan', 'name', v)} />
        <Field label="Descrição" value={siteConfig.priorityPlan.description} onChange={(v) => updateNested('priorityPlan', 'description', v)} />
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Preço (R$)</label>
          <input
            type="number"
            step="0.01"
            value={siteConfig.priorityPlan.price}
            onChange={(e) => { updateNested('priorityPlan', 'price', parseFloat(e.target.value) || 0); }}
            className="w-32 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>
      </Section>

      {/* PDF Download Plan */}
      <Section title="Plano Download de PDF" icon="📄">
        <Field label="Nome do plano" value={siteConfig.pdfDownloadPlan?.name || 'Download de Currículo em PDF'} onChange={(v) => updateNested('pdfDownloadPlan', 'name', v)} />
        <Field label="Descrição" value={siteConfig.pdfDownloadPlan?.description || 'Baixe seu currículo profissional em PDF'} onChange={(v) => updateNested('pdfDownloadPlan', 'description', v)} />
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Preço (R$)</label>
          <input
            type="number"
            step="0.01"
            value={siteConfig.pdfDownloadPlan?.price ?? 12.90}
            onChange={(e) => { updateNested('pdfDownloadPlan', 'price', parseFloat(e.target.value) || 0); }}
            className="w-32 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>
      </Section>

      {/* System Rules */}
      <Section title="Regras do Sistema" icon="⚙️">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Envios gratuitos por novo usuário</label>
          <input
            type="number"
            min={0}
            value={siteConfig.rules.freeSendCredits}
            onChange={(e) => updateNested('rules', 'freeSendCredits', parseInt(e.target.value) || 0)}
            className="w-32 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Vagas em destaque na landing (quantidade)</label>
          <input
            type="number"
            min={1}
            max={20}
            value={siteConfig.rules.featuredJobsCount}
            onChange={(e) => updateNested('rules', 'featuredJobsCount', parseInt(e.target.value) || 6)}
            className="w-32 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>
      </Section>
    </div>
  );
}
