export default function installGlobalFetchErrorHandler() {
  if (typeof window === 'undefined' || !window.fetch) return;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input, init = {}) => {
    // Allow callers to opt out of redirect behavior by passing { skipErrorRedirect: true }
    const { skipErrorRedirect, ...fetchInit } = init;

    try {
      const res = await originalFetch(input, fetchInit);

      // Decide whether to redirect only for API requests
      let requestUrl;
      try {
        requestUrl = typeof input === 'string' ? input : input.url;
      } catch (e) {
        requestUrl = '';
      }

      const path = (() => {
        try {
          return new URL(requestUrl, window.location.origin).pathname;
        } catch (e) {
          return '';
        }
      })();

      const isApi = path.startsWith('/api/');

      if (!skipErrorRedirect && isApi && !res.ok) {
        if (res.status === 401) {
          // Unauthorized -> send to login
          window.location.href = '/login';
        } else if (res.status === 403) {
          window.location.href = '/403';
        } else if (res.status === 500) {
          window.location.href = '/500';
        }
      }

      return res;
    } catch (err) {
      if (!skipErrorRedirect) {
        // network-level problems -> show server error page
        window.location.href = '/500';
      }
      throw err;
    }
  };
}
