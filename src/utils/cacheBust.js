// Cache-busting for local assets only
const ASSET_VERSION = Date.now();

export function cacheBust(url) {
  if (!url || url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('http')) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${ASSET_VERSION}`;
}
