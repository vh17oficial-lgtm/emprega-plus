import { useState, useEffect, useRef } from 'react';
import { JOB_CATEGORIES, WORK_TYPES, JOB_LEVELS, EDUCATION_LEVELS } from '../../data/jobConstants';

const emptyFilters = { search: '', category: '', workType: '', level: '', escolaridade: '', location: '' };

export default function JobFilters({ filters, onChange, resultCount, totalCount }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerRef = useRef(null);

  const set = (key, value) => onChange({ ...filters, [key]: value });
  const clear = () => onChange({ ...emptyFilters });

  const activeFilters = Object.entries(filters).filter(([, v]) => v !== '');
  const hasActive = activeFilters.length > 0;

  // Close drawer on Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e) => { if (e.key === 'Escape') setMobileOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [mobileOpen]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const labelMap = { search: 'Busca', category: 'Nicho', workType: 'Tipo', level: 'Nível', escolaridade: 'Escolaridade', location: 'Local' };

  const inputClass = 'w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow';
  const selectClass = `${inputClass} appearance-none cursor-pointer`;

  const FilterFields = ({ id }) => (
    <>
      {/* Search */}
      <div className={id === 'mobile' ? '' : 'lg:col-span-2'}>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => set('search', e.target.value)}
            placeholder="Buscar vaga ou empresa..."
            className={`${inputClass} pl-9`}
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <select value={filters.category} onChange={(e) => set('category', e.target.value)} className={selectClass}>
          <option value="">Todos os nichos</option>
          {JOB_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Work type */}
      <div>
        <select value={filters.workType} onChange={(e) => set('workType', e.target.value)} className={selectClass}>
          <option value="">Tipo de trabalho</option>
          {WORK_TYPES.map((w) => <option key={w} value={w}>{w}</option>)}
        </select>
      </div>

      {/* Level */}
      <div>
        <select value={filters.level} onChange={(e) => set('level', e.target.value)} className={selectClass}>
          <option value="">Nível da vaga</option>
          {JOB_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      {/* Escolaridade */}
      <div>
        <select value={filters.escolaridade} onChange={(e) => set('escolaridade', e.target.value)} className={selectClass}>
          <option value="">Escolaridade</option>
          {EDUCATION_LEVELS.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      {/* Location */}
      <div>
        <input
          type="text"
          value={filters.location}
          onChange={(e) => set('location', e.target.value)}
          placeholder="Cidade ou estado..."
          className={inputClass}
        />
      </div>
    </>
  );

  return (
    <div className="space-y-3 mb-6">
      {/* Desktop filters */}
      <div className="hidden lg:grid lg:grid-cols-8 gap-3">
        <FilterFields id="desktop" />
        {hasActive && (
          <div className="flex items-center">
            <button onClick={clear} className="text-xs text-gray-500 hover:text-red-500 transition-colors cursor-pointer whitespace-nowrap font-medium">
              ✕ Limpar
            </button>
          </div>
        )}
      </div>

      {/* Mobile: toggle button */}
      <div className="lg:hidden flex items-center gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => set('search', e.target.value)}
            placeholder="Buscar vaga ou empresa..."
            className={`${inputClass} pl-9`}
          />
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors cursor-pointer shrink-0 ${
            hasActive
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filtrar
          {hasActive && (
            <span className="w-5 h-5 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center">
              {activeFilters.length}
            </span>
          )}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div
            ref={drawerRef}
            className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl flex flex-col animate-[slideIn_0.25s_ease-out]"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">Filtros</h3>
              <button onClick={() => setMobileOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Nicho</label>
                <select value={filters.category} onChange={(e) => set('category', e.target.value)} className={selectClass}>
                  <option value="">Todos os nichos</option>
                  {JOB_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Tipo de trabalho</label>
                <select value={filters.workType} onChange={(e) => set('workType', e.target.value)} className={selectClass}>
                  <option value="">Todos</option>
                  {WORK_TYPES.map((w) => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Nível</label>
                <select value={filters.level} onChange={(e) => set('level', e.target.value)} className={selectClass}>
                  <option value="">Todos os níveis</option>
                  {JOB_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Escolaridade</label>
                <select value={filters.escolaridade} onChange={(e) => set('escolaridade', e.target.value)} className={selectClass}>
                  <option value="">Todas</option>
                  {EDUCATION_LEVELS.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Localização</label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => set('location', e.target.value)}
                  placeholder="Cidade ou estado..."
                  className={inputClass}
                />
              </div>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
              {hasActive && (
                <button onClick={clear} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors">
                  Limpar tudo
                </button>
              )}
              <button
                onClick={() => setMobileOpen(false)}
                className="flex-1 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 cursor-pointer transition-colors"
              >
                Ver {resultCount} vaga(s)
              </button>
            </div>
          </div>
          <style>{`
            @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
          `}</style>
        </div>
      )}

      {/* Active filter tags + result count */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-500 font-medium">
          {resultCount === totalCount
            ? `${totalCount} vaga(s)`
            : `${resultCount} de ${totalCount} vaga(s)`
          }
        </span>

        {activeFilters.map(([key, value]) => (
          <span
            key={key}
            className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-medium pl-2.5 pr-1.5 py-1 rounded-full border border-indigo-100"
          >
            {labelMap[key]}: {value}
            <button
              onClick={() => set(key, '')}
              className="w-4 h-4 rounded-full hover:bg-indigo-200 flex items-center justify-center text-indigo-500 cursor-pointer transition-colors"
            >
              ×
            </button>
          </span>
        ))}

        {hasActive && (
          <button
            onClick={clear}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors cursor-pointer ml-1 hidden lg:inline"
          >
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}
