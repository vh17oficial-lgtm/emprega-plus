import { useAppContext } from '../../context/AppContext';
import { cacheBust } from '../../utils/cacheBust';

export default function BrandMarquee() {
  const { companies } = useAppContext();
  const active = companies.filter((c) => c.active);
  if (active.length === 0) return null;

  const tripled = [...active, ...active, ...active];

  return (
    <section className="relative py-8 sm:py-10 overflow-hidden bg-slate-100/80 border-y border-slate-200/60">
      <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-slate-500 mb-5 px-6">
        Candidatos conectados a empresas líderes
      </p>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-r from-slate-100/80 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-l from-slate-100/80 to-transparent z-10" />

        <div className="flex lp-scroll-x">
          {tripled.map((company, i) => (
            <div key={i} className="shrink-0 px-6 sm:px-10 group cursor-default">
              <div className="flex items-center gap-2.5 opacity-50 group-hover:opacity-80 transition-opacity duration-300">
                {company.logo ? (
                  <img src={cacheBust(company.logo)} alt={company.name} className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg object-contain" />
                ) : (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-800/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-slate-700/60">{company.name.charAt(0)}</span>
                  </div>
                )}
                <span className="text-sm sm:text-base font-semibold text-slate-800/80 whitespace-nowrap">
                  {company.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
