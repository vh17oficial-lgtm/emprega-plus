import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { cacheBust } from '../../utils/cacheBust';

function pickDiverseFeatured(jobs, count = 6) {
  const active = jobs.filter(j => j.status !== 'encerrada');
  if (active.length <= count) return active;

  // Time-based seed so selection rotates every 30 min
  const seed = Math.floor(Date.now() / (1000 * 60 * 30));
  const seededRandom = (i) => {
    let x = Math.sin(seed + i) * 10000;
    return x - Math.floor(x);
  };

  // Shuffle with seeded random
  const shuffled = [...active];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(i) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Pick diverse: avoid repeating companies and categories
  const picked = [];
  const usedCompanies = new Set();
  const usedCategories = new Set();

  // First pass: prioritize unique company + category
  for (const job of shuffled) {
    if (picked.length >= count) break;
    if (!usedCompanies.has(job.company)) {
      picked.push(job);
      usedCompanies.add(job.company);
      usedCategories.add(job.category);
    }
  }

  // Second pass: fill remaining allowing repeated categories but still unique companies
  if (picked.length < count) {
    for (const job of shuffled) {
      if (picked.length >= count) break;
      if (!picked.includes(job) && !usedCompanies.has(job.company)) {
        picked.push(job);
        usedCompanies.add(job.company);
      }
    }
  }

  // Last resort: fill with any remaining
  if (picked.length < count) {
    for (const job of shuffled) {
      if (picked.length >= count) break;
      if (!picked.includes(job)) picked.push(job);
    }
  }

  return picked;
}

export default function FeaturedJobs() {
  const { jobs } = useAppContext();
  const featured = useMemo(() => pickDiverseFeatured(jobs, 6), [jobs]);

  return (
    <section className="py-16 sm:py-20" style={{ background: 'var(--lp-section-alt)' }}>
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600 mb-1">Oportunidades</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Vagas em destaque</h2>
            <p className="text-slate-500 mt-1 text-sm">As melhores oportunidades selecionadas para você.</p>
          </div>
          <Link to="/usuario?tab=vagas">
            <button className="lp-gradient-primary text-white font-semibold px-6 py-3 rounded-lg text-sm transition-all cursor-pointer hover:shadow-md hover:scale-[1.01]">
              Ver todas as vagas →
            </button>
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {featured.map((job) => (
            <Link to="/usuario?tab=vagas" key={job.id} className="group">
              <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-blue-200/60 transition-all duration-300 h-full">
                <div className="flex items-start justify-between mb-3">
                  {job.logo ? (
                    <img
                      src={cacheBust(job.logo)}
                      alt={job.company}
                      className="w-10 h-10 rounded-lg object-contain bg-slate-50 border border-slate-100 p-1"
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                  ) : null}
                  <div
                    className="w-10 h-10 rounded-lg bg-blue-50 items-center justify-center text-blue-600 text-xs font-bold"
                    style={{ display: job.logo ? 'none' : 'flex' }}
                  >
                    {job.company?.charAt(0) || 'E'}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {job.salary && (
                      <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Briefcase className="h-3 w-3" /> {job.workType || 'CLT'}
                      </span>
                    )}
                    <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Nova</span>
                  </div>
                </div>
                <h3 className="font-bold text-slate-900 mb-1 text-sm sm:text-base group-hover:text-blue-600 transition-colors">{job.title}</h3>
                <p className="text-sm text-blue-600 font-medium">{job.company}</p>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" /> {job.location}
                </p>
                <p className="text-xs sm:text-sm text-slate-500 mt-2.5 line-clamp-2">{job.description}</p>
                {job.salary && (
                  <div className="flex items-center gap-1 mt-3 text-sm font-semibold text-slate-900">
                    {job.salary}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
