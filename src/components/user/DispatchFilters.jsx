import { JOB_CATEGORIES, WORK_TYPES, JOB_LEVELS, EDUCATION_LEVELS } from '../../data/jobConstants';

export default function DispatchFilters({ filters, onChange, matchCount }) {
  const updateFilter = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const clearAll = () => {
    onChange({ category: '', workType: '', level: '', escolaridade: '', location: '' });
  };

  const hasActiveFilters = filters.category || filters.workType || filters.level || filters.escolaridade || filters.location;

  const activeFiltersList = [
    filters.category && { key: 'category', label: filters.category },
    filters.workType && { key: 'workType', label: filters.workType },
    filters.level && { key: 'level', label: filters.level },
    filters.escolaridade && { key: 'escolaridade', label: filters.escolaridade },
    filters.location && { key: 'location', label: filters.location },
  ].filter(Boolean);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          🎯 Filtrar vagas para disparo
        </h4>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
          >
            Limpar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <select
          value={filters.category}
          onChange={(e) => updateFilter('category', e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white appearance-none cursor-pointer"
        >
          <option value="">Todos os nichos</option>
          {JOB_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          value={filters.workType}
          onChange={(e) => updateFilter('workType', e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white appearance-none cursor-pointer"
        >
          <option value="">Todos os tipos</option>
          {WORK_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select
          value={filters.level}
          onChange={(e) => updateFilter('level', e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white appearance-none cursor-pointer"
        >
          <option value="">Todos os níveis</option>
          {JOB_LEVELS.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>

        <select
          value={filters.escolaridade}
          onChange={(e) => updateFilter('escolaridade', e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white appearance-none cursor-pointer"
        >
          <option value="">Escolaridade</option>
          {EDUCATION_LEVELS.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>

        <input
          type="text"
          value={filters.location}
          onChange={(e) => updateFilter('location', e.target.value)}
          placeholder="Cidade ou estado..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Active filters tags */}
      {activeFiltersList.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {activeFiltersList.map((f) => (
            <span
              key={f.key}
              className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full border border-indigo-100"
            >
              {f.label}
              <button
                onClick={() => updateFilter(f.key, '')}
                className="hover:text-red-500 transition-colors cursor-pointer ml-0.5"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Match count */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        {hasActiveFilters ? (
          <p className="text-xs text-gray-600">
            <span className="font-bold text-indigo-600">{matchCount}</span> vaga(s) encontrada(s) com seus filtros
          </p>
        ) : (
          <p className="text-xs text-gray-500">
            Mostrando todas as <span className="font-bold text-gray-700">{matchCount}</span> vagas disponíveis
          </p>
        )}
      </div>
    </div>
  );
}
