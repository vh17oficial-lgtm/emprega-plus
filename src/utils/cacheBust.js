// Cache-busting for local assets only.
// Accepts optional `version` (timestamp) — use it for assets that can change dynamically (ex: company logos).
const ASSET_VERSION = Date.now();

export function cacheBust(url, version) {
  if (!url) return url;
  // Data URIs and blobs embed the bytes; browser doesn't cache them by URL.
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;
  // External http(s) URLs — if caller provided a version, append it to force reload.
  if (url.startsWith('http')) {
    if (!version) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}v=${version}`;
  }
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${version || ASSET_VERSION}`;
}
