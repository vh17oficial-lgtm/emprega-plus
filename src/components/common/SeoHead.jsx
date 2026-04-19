import { useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';

export default function SeoHead() {
  const { siteConfig } = useAppContext();
  const seo = siteConfig.seo;

  useEffect(() => {
    if (!seo) return;

    if (seo.title) document.title = seo.title;

    const setMeta = (name, content) => {
      if (!content) return;
      let tag = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(name.startsWith('og:') ? 'property' : 'name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    setMeta('description', seo.description);
    setMeta('keywords', seo.keywords);
    setMeta('og:title', seo.title);
    setMeta('og:description', seo.description);
    setMeta('og:image', seo.ogImage);
  }, [seo]);

  return null;
}
