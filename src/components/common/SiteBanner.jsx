import { useState } from 'react';
import { X } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const STYLES = {
  info:    'bg-blue-600 text-white',
  warning: 'bg-amber-500 text-white',
  success: 'bg-emerald-600 text-white',
  promo:   'bg-gradient-to-r from-purple-600 to-indigo-600 text-white',
};

export default function SiteBanner() {
  const { siteConfig } = useAppContext();
  const [dismissed, setDismissed] = useState(false);

  const banner = siteConfig.banner;
  if (!banner?.enabled || !banner.text || dismissed) return null;

  return (
    <div className={`${STYLES[banner.type] || STYLES.info} px-4 py-2 text-sm font-medium text-center relative`}>
      <span>{banner.text}</span>
      {banner.dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
