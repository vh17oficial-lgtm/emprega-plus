import { Sparkles, Palette, Zap, Rocket } from 'lucide-react';

const benefits = [
  {
    icon: Sparkles,
    title: 'Crie currículo sem experiência',
    description: 'Nossos modelos profissionais ajudam você a criar um currículo impressionante, mesmo sendo seu primeiro.',
  },
  {
    icon: Palette,
    title: 'Visual profissional automático',
    description: 'Escolha entre modelos premium que formatam tudo automaticamente. Seu currículo fica perfeito em segundos.',
  },
  {
    icon: Zap,
    title: 'Envio com apenas 1 clique',
    description: 'Candidate-se a vagas instantaneamente. Sem formulários longos, sem complicação, sem espera.',
  },
  {
    icon: Rocket,
    title: 'Disparo automático em massa',
    description: 'Envie seu currículo para dezenas de vagas ao mesmo tempo e multiplique suas chances.',
  },
];

export default function Benefits() {
  return (
    <section className="py-16 sm:py-20" style={{ background: 'var(--lp-section-alt)' }}>
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-600 mb-2">Por que usar o Emprega+</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 mb-3">
            Tudo que você precisa para conseguir seu emprego
          </h2>
          <p className="text-slate-500 max-w-lg mx-auto text-sm sm:text-base">
            Ferramentas simples e poderosas que facilitam cada etapa da sua busca por emprego.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <div key={i} className="group p-5 sm:p-6 rounded-xl border border-slate-200 bg-white hover:shadow-md hover:border-blue-200/60 transition-all duration-300">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-105 transition-transform duration-300">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-1.5 text-sm sm:text-base">{b.title}</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{b.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
