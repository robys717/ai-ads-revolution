const ORIG_FETCH = window.fetch.bind(window);
function rewrite(url: RequestInfo | URL): RequestInfo | URL {
  try {
    const u = typeof url === 'string' ? new URL(url) : new URL(String(url));
    if (location.hostname !== 'localhost') {
      if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') {
        // rimuovi schema+host e tieni solo pathname+search
        return u.pathname + u.search + u.hash;
      }
    }
  } catch {}
  return url;
}
window.fetch = (input: RequestInfo | URL, init?: RequestInit) => ORIG_FETCH(rewrite(input), init);
export {};
