import { FileText, Target, Send } from 'lucide-react';

const steps = [
  {
    icon: FileText,
    step: '01',
    title: 'Crie seu currículo',
    description: 'Preencha seus dados e escolha um modelo profissional. Seu currículo fica pronto em minutos.',
  },
  {
    icon: Target,
    step: '02',
    title: 'Escolha uma vaga',
    description: 'Navegue por centenas de vagas reais e encontre a oportunidade perfeita para você.',
  },
  {
    icon: Send,
    step: '03',
    title: 'Candidate-se com 1 clique',
    description: 'Envie seu currículo diretamente para a empresa. Sem formulários longos, sem burocracia.',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-600 mb-2">Simples e rápido</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 mb-3">
            Três passos para o seu próximo emprego
          </h2>
          <p className="text-slate-500 max-w-lg mx-auto text-sm sm:text-base">
            Sem complicação. Sem burocracia. Comece agora e se candidate em minutos.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="relative group text-center p-6 rounded-xl border border-slate-200 bg-white hover:shadow-md transition-shadow duration-300">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 mb-4 transition-transform duration-300 group-hover:scale-105">
                  <Icon className="h-6 w-6" />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Passo {s.step}</p>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
