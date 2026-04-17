const templates = [
  {
    id: 'classico',
    name: 'Clássico',
    desc: 'Simples e organizado',
    preview: (
      <div className="p-2 h-full space-y-1">
        <div className="h-1.5 bg-gray-800 rounded w-1/2 mx-auto" />
        <div className="h-0.5 bg-gray-300 rounded w-1/3 mx-auto" />
        <div className="h-[2px] bg-gray-800 rounded mt-1.5 mb-1" />
        <div className="space-y-0.5">
          <div className="h-0.5 bg-gray-300 rounded w-1/3" />
          <div className="flex gap-0.5"><div className="w-1 h-1 bg-gray-300 rounded-full shrink-0" /><div className="h-0.5 bg-gray-200 rounded flex-1 mt-0.5" /></div>
          <div className="flex gap-0.5"><div className="w-1 h-1 bg-gray-300 rounded-full shrink-0" /><div className="h-0.5 bg-gray-200 rounded flex-1 mt-0.5" /></div>
        </div>
        <div className="space-y-0.5 pt-0.5">
          <div className="h-0.5 bg-gray-300 rounded w-1/4" />
          <div className="flex gap-0.5"><div className="w-1 h-1 bg-gray-300 rounded-full shrink-0" /><div className="h-0.5 bg-gray-200 rounded flex-1 mt-0.5" /></div>
          <div className="flex gap-0.5"><div className="w-1 h-1 bg-gray-300 rounded-full shrink-0" /><div className="h-0.5 bg-gray-200 rounded flex-1 mt-0.5" /></div>
        </div>
      </div>
    ),
  },
  {
    id: 'profissional',
    name: 'Profissional',
    desc: 'Faixa escura com foto',
    preview: (
      <div className="h-full">
        <div className="bg-slate-700 p-1.5 flex items-center gap-1.5 rounded-t">
          <div className="w-4 h-4 bg-white/20 rounded-full shrink-0" />
          <div className="space-y-0.5 flex-1">
            <div className="h-1 bg-white/40 rounded w-3/4" />
            <div className="h-0.5 bg-white/20 rounded w-1/2" />
          </div>
        </div>
        <div className="p-1.5 space-y-1">
          <div className="h-0.5 bg-gray-300 rounded w-1/3" />
          <div className="flex gap-0.5"><div className="w-1 h-1 bg-gray-300 rounded-full shrink-0" /><div className="h-0.5 bg-gray-200 rounded flex-1 mt-0.5" /></div>
          <div className="flex gap-0.5"><div className="w-1 h-1 bg-gray-300 rounded-full shrink-0" /><div className="h-0.5 bg-gray-200 rounded flex-1 mt-0.5" /></div>
          <div className="h-0.5 bg-gray-300 rounded w-1/4 mt-0.5" />
          <div className="flex gap-0.5"><div className="w-1 h-1 bg-gray-300 rounded-full shrink-0" /><div className="h-0.5 bg-gray-200 rounded flex-1 mt-0.5" /></div>
        </div>
      </div>
    ),
  },
  {
    id: 'executivo',
    name: 'Executivo',
    desc: 'Coluna lateral moderna',
    preview: (
      <div className="flex h-full">
        <div className="w-[33%] bg-slate-700 rounded-l p-1 space-y-1">
          <div className="w-3.5 h-3.5 bg-white/20 rounded-full mx-auto mt-0.5" />
          <div className="h-0.5 bg-white/30 rounded w-3/4 mx-auto" />
          <div className="space-y-0.5 pt-0.5">
            <div className="h-0.5 bg-white/20 rounded" />
            <div className="h-0.5 bg-white/20 rounded w-3/4" />
          </div>
        </div>
        <div className="flex-1 p-1.5 space-y-1">
          <div className="h-0.5 bg-gray-300 rounded w-1/2" />
          <div className="flex gap-0.5"><div className="w-1 h-1 bg-gray-300 rounded-full shrink-0" /><div className="h-0.5 bg-gray-200 rounded flex-1 mt-0.5" /></div>
          <div className="flex gap-0.5"><div className="w-1 h-1 bg-gray-300 rounded-full shrink-0" /><div className="h-0.5 bg-gray-200 rounded flex-1 mt-0.5" /></div>
          <div className="h-0.5 bg-gray-300 rounded w-1/3 mt-0.5" />
          <div className="flex gap-0.5"><div className="w-1 h-1 bg-gray-300 rounded-full shrink-0" /><div className="h-0.5 bg-gray-200 rounded flex-1 mt-0.5" /></div>
        </div>
      </div>
    ),
  },
];

export default function TemplateSelector({ selected, onSelect }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-800 mb-1">Modelo do Currículo</h3>
      <p className="text-xs text-gray-400 mb-3">Escolha o layout que mais combina com seu perfil</p>
      <div className="grid grid-cols-3 gap-3">
        {templates.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t.id)}
            className={`group relative rounded-xl border-2 overflow-hidden transition-all cursor-pointer ${
              selected === t.id
                ? 'border-indigo-600 ring-2 ring-indigo-600/20 shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <div className="aspect-[3/4] bg-white">{t.preview}</div>
            <div className={`px-2 py-1.5 text-left border-t ${selected === t.id ? 'bg-indigo-50 border-indigo-100' : 'bg-gray-50 border-gray-100'}`}>
              <p className={`text-xs font-semibold ${selected === t.id ? 'text-indigo-700' : 'text-gray-700'}`}>{t.name}</p>
              <p className="text-[10px] text-gray-400 leading-tight">{t.desc}</p>
            </div>
            {selected === t.id && (
              <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center shadow">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
