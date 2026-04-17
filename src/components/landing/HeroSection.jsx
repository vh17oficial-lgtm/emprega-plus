import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Sparkles } from 'lucide-react';

const stats = [
  { value: '1.200+', label: 'Currículos criados' },
  { value: '340+', label: 'Vagas disponíveis' },
  { value: '2.800+', label: 'Candidaturas enviadas' },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(12, 17, 34, 0.85) 0%, rgba(14, 20, 40, 0.9) 100%)' }}>
      {/* Dot grid */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
        backgroundSize: '48px 48px',
      }} />
      {/* Ambient light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[250px] sm:w-[600px] sm:h-[400px] rounded-full blur-[150px]" style={{ background: 'hsl(215, 80%, 48%, 0.06)' }} />

      <div className="relative mx-auto max-w-7xl px-6 sm:px-8 py-16 sm:py-20 lg:py-28 pb-8 sm:pb-10 lg:pb-14">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* Left */}
          <div className="flex-1 text-center lg:text-left max-w-2xl">
            <h1 className="lp-fade-up-1 text-3xl sm:text-4xl lg:text-6xl font-extrabold leading-[1.12] tracking-tight text-white mb-6">
              Crie seu currículo em{' '}
              <span className="lp-text-gradient">2 minutos</span> e se candidate a vagas{' '}
              <span className="lp-text-gradient">com 1 clique</span>
            </h1>

            <p className="lp-fade-up-2 text-base sm:text-lg text-white/60 max-w-lg mx-auto lg:mx-0 mb-10">
              Mesmo sem experiência, você pode criar um currículo profissional e enviar para empresas de forma simples e rápida.
            </p>

            <div className="lp-fade-up-3 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link to="/usuario">
                <button className="w-full sm:w-auto lp-gradient-primary text-white lp-shadow-glow hover:shadow-md hover:scale-[1.01] transition-all duration-300 font-semibold tracking-wide relative inline-flex items-center justify-center h-14 rounded-xl pl-10 pr-14 text-base cursor-pointer">
                  CRIAR MEU CURRÍCULO AGORA
                  <ArrowRight className="absolute right-5 h-5 w-5" />
                </button>
              </Link>
              <Link to="/usuario?tab=vagas">
                <button className="w-full sm:w-auto border border-white/25 text-white bg-transparent hover:bg-white/5 transition-all duration-300 font-medium inline-flex items-center justify-center h-11 rounded-lg px-8 cursor-pointer">
                  Ver vagas disponíveis
                </button>
              </Link>
              <Link to="/usuario?tab=upload">
                <button className="w-full sm:w-auto text-white/70 hover:text-white underline underline-offset-4 transition-all duration-300 font-medium inline-flex items-center justify-center h-11 px-4 cursor-pointer">
                  Já tenho currículo
                </button>
              </Link>
            </div>

            {/* Stats */}
            <div className="lp-fade-up-3 grid grid-cols-3 gap-4 mt-12 max-w-sm mx-auto lg:mx-0 lg:max-w-md">
              {stats.map((s) => (
                <div key={s.label} className="text-center lg:text-left">
                  <p className="text-xl sm:text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-[11px] sm:text-xs text-white/50">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Resume card — below text on mobile, right side on desktop */}
          <div className="lp-fade-up-2 flex-shrink-0 w-full max-w-[280px] sm:max-w-[320px] lg:max-w-none lg:w-80 mx-auto lg:mx-0">
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl blur-2xl" style={{ background: 'hsl(215, 80%, 48%, 0.1)' }} />

              <div className="relative rounded-2xl bg-white shadow-xl overflow-hidden border border-slate-200/40">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400/50" />
                    <div className="w-3 h-3 rounded-full bg-amber-400/50" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400/50" />
                  </div>
                  <span className="text-xs text-slate-500 ml-2">currículo_profissional.pdf</span>
                  <span className="ml-auto text-xs text-slate-500">PDF ↓</span>
                </div>

                <div className="p-5 sm:p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full lp-gradient-primary flex items-center justify-center text-white font-bold text-sm">MS</div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">Maria Silva</p>
                      <p className="text-xs text-slate-500">Analista Administrativa</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--lp-primary)' }}>Objetivo Profissional</p>
                    <div className="space-y-1">
                      <div className="h-2 bg-slate-100 rounded-full w-full" />
                      <div className="h-2 bg-slate-100 rounded-full w-4/5" />
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--lp-primary)' }}>Experiência</p>
                    <div className="space-y-1">
                      <div className="h-2 bg-slate-100 rounded-full w-full" />
                      <div className="h-2 bg-slate-100 rounded-full w-3/4" />
                      <div className="h-2 bg-slate-100 rounded-full w-5/6" />
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--lp-primary)' }}>Habilidades</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {['Organização', 'Excel', 'Comunicação'].map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-medium">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-3 -right-3 flex items-center gap-1.5 rounded-full lp-gradient-primary px-3 py-1.5 text-white text-xs font-semibold shadow-md">
                <Sparkles className="h-3.5 w-3.5" />
                Currículo pronto!
              </div>

              {/* Floating notification */}
              <div className="absolute -bottom-4 -left-2 sm:-left-4 flex items-center gap-2 rounded-xl bg-white px-3 sm:px-4 py-2 sm:py-2.5 shadow-md border border-slate-200">
                <FileText className="h-4 w-4 shrink-0" style={{ color: 'var(--lp-primary)' }} />
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-xs font-semibold text-slate-900">Candidatura enviada!</p>
                  <p className="text-[10px] text-slate-500">há 2 min • Amazon Brasil</p>
                </div>
                <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
