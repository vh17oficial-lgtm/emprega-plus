export default function ProductPreview() {
  return (
    <section className="py-16 sm:py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wider">Veja na prática</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
            Uma plataforma completa para sua carreira
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Do currículo à candidatura, tudo em um só lugar.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Resume card */}
          <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-6 border border-indigo-100 hover:shadow-lg transition-all duration-300 group">
            <div className="bg-white rounded-xl p-5 shadow-sm mb-5 border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-sm font-bold text-indigo-600">JS</div>
                <div>
                  <div className="text-sm font-bold text-gray-900">João Santos</div>
                  <div className="text-xs text-indigo-600">Analista de RH</div>
                </div>
              </div>
              <div className="space-y-2 mb-3">
                <div className="h-2 bg-gray-100 rounded-full w-full" />
                <div className="h-2 bg-gray-100 rounded-full w-4/5" />
                <div className="h-2 bg-gray-100 rounded-full w-3/5" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['Excel', 'RH', 'Folha'].map((t) => (
                  <span key={t} className="bg-indigo-50 text-indigo-600 text-[10px] font-medium px-2 py-0.5 rounded">{t}</span>
                ))}
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              📄 Currículo Profissional
            </h3>
            <p className="text-sm text-gray-500">3 modelos premium para impressionar recrutadores.</p>
          </div>

          {/* Jobs card */}
          <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-6 border border-purple-100 hover:shadow-lg transition-all duration-300 group">
            <div className="space-y-3 mb-5">
              {[
                { title: 'Analista de Dados', co: 'DataFlow', tag: 'Remoto' },
                { title: 'Designer UX/UI', co: 'Criativa', tag: 'Híbrido' },
                { title: 'Dev Frontend', co: 'TechNova', tag: 'Presencial' },
              ].map((j) => (
                <div key={j.title} className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{j.title}</p>
                    <p className="text-xs text-gray-400">{j.co}</p>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-medium">{j.tag}</span>
                </div>
              ))}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              💼 Vagas Atualizadas
            </h3>
            <p className="text-sm text-gray-500">Centenas de oportunidades de empresas reais.</p>
          </div>

          {/* Application card */}
          <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-6 border border-emerald-100 hover:shadow-lg transition-all duration-300 group">
            <div className="bg-white rounded-xl p-5 shadow-sm mb-5 border border-gray-100 text-center">
              <div className="text-4xl mb-2">🎉</div>
              <p className="text-sm font-bold text-gray-900 mb-1">Candidatura enviada!</p>
              <p className="text-xs text-gray-400 mb-3">Currículo enviado para TechNova Solutions</p>
              <div className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs text-emerald-600 font-medium">Enviado com sucesso</span>
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              🚀 Candidatura Instantânea
            </h3>
            <p className="text-sm text-gray-500">Envie para várias empresas com apenas 1 clique.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
