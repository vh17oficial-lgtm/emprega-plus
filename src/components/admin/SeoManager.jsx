import { useAppContext } from '../../context/AppContext';

export default function SeoManager() {
  const { siteConfig, updateSiteConfig } = useAppContext();
  const seo = siteConfig.seo || { title: '', description: '', keywords: '', ogImage: '' };

  const update = (key, value) => {
    updateSiteConfig({ seo: { ...seo, [key]: value } });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">🔍 SEO</h3>
        <p className="text-sm text-gray-500 mt-1">Otimize como seu site aparece no Google e nas redes sociais.</p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Título da página (title tag)</label>
        <input
          value={seo.title}
          onChange={(e) => update('title', e.target.value)}
          placeholder="Emprega+ | Plataforma de Empregabilidade"
          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        />
        <p className="text-[10px] text-gray-400 mt-1">{(seo.title || '').length}/60 caracteres recomendados</p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Meta descrição</label>
        <textarea
          value={seo.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="Crie seu currículo profissional e candidate-se a vagas de emprego..."
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
        />
        <p className="text-[10px] text-gray-400 mt-1">{(seo.description || '').length}/160 caracteres recomendados</p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Palavras-chave (separadas por vírgula)</label>
        <input
          value={seo.keywords}
          onChange={(e) => update('keywords', e.target.value)}
          placeholder="emprego, currículo, vagas, trabalho"
          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Imagem de compartilhamento (URL da imagem)</label>
        <input
          value={seo.ogImage}
          onChange={(e) => update('ogImage', e.target.value)}
          placeholder="https://empregaplus.com/og-image.png"
          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        />
        <p className="text-[10px] text-gray-400 mt-1">Imagem exibida ao compartilhar o link (1200x630px ideal)</p>
      </div>

      {/* Preview */}
      <div className="border border-gray-200 rounded-xl p-5">
        <p className="text-xs font-semibold text-gray-600 mb-3">Pré-visualização no Google</p>
        <div className="max-w-lg">
          <p className="text-blue-700 text-base font-medium hover:underline truncate">
            {seo.title || 'Emprega+ | Plataforma de Empregabilidade'}
          </p>
          <p className="text-emerald-700 text-xs mt-0.5">www.empregaplus.com</p>
          <p className="text-gray-600 text-xs mt-1 line-clamp-2">
            {seo.description || 'Crie seu currículo profissional em minutos e se candidate a vagas de emprego.'}
          </p>
        </div>
      </div>
    </div>
  );
}
