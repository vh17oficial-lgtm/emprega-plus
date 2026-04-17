import { Star, Quote } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function TestimonialsSection() {
  const { testimonials } = useAppContext();
  const active = testimonials.filter((t) => t.active);
  if (active.length === 0) return null;

  const getInitials = (name) => name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-600 mb-2">Depoimentos</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 mb-3">
            Quem usou, recomenda
          </h2>
          <p className="text-slate-500 max-w-lg mx-auto text-sm sm:text-base">
            Milhares de pessoas já encontraram oportunidades usando o Emprega+. Veja o que elas dizem.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 max-w-5xl mx-auto">
          {active.map((t) => (
            <div key={t.id} className="relative bg-white rounded-xl border border-slate-200 p-5 sm:p-6 hover:shadow-md transition-shadow duration-300">
              <Quote className="absolute top-4 right-4 h-5 w-5 text-slate-200/40" />

              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.stars || 5 }).map((_, j) => (
                  <Star key={j} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-sm text-slate-800 leading-relaxed mb-4">"{t.text}"</p>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden border border-blue-100">
                  {t.photo ? (
                    <img src={t.photo} alt={t.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-blue-600 text-[10px] font-bold">{getInitials(t.name)}</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 mt-10 text-xs sm:text-sm text-slate-400">
          <span className="flex items-center gap-1.5">🛡️ Plataforma 100% segura</span>
          <span className="flex items-center gap-1.5">👥 +2.800 candidaturas enviadas</span>
          <span className="flex items-center gap-1.5">⭐ Nota 4.9 de satisfação</span>
        </div>
      </div>
    </section>
  );
}
