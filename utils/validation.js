const isValidId = value => typeof value === 'string' && /^[0-9a-fA-F]{24}$/.test(value);

const validYouTubeUrl = value => {
  if (!value) return true;
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) return false;
    const host = url.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') return Boolean(url.pathname.split('/').filter(Boolean)[0]);
    if (!['youtube.com', 'm.youtube.com'].includes(host)) return false;
    return Boolean(url.searchParams.get('v') || url.pathname.match(/^\/(embed|shorts)\/[^/]+/));
  } catch (err) {
    return false;
  }
};

const uniqueIds = ids => (Array.isArray(ids) ? [...new Set(ids.map(String))] : []);

module.exports = { isValidId, validYouTubeUrl, uniqueIds };
