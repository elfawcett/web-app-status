const apps = require('./_config.js').apps

/**
 * Axios response interceptor to keep unreachable URLs from throwing errors.
 */
function interceptorSuccess(response) {
  /* Filter apps array for a URL match, then get first result's name property. */
  const { name, group } = apps.filter(app => app.url === response.config.url)[0] || { name: '', group: '' }

  /* We actually only care about the response's original URL, status, and app name,
    so don't bother returning response.data or anything else. */
  return { name, group, status: response.status, url: response.config.url }
}

function interceptorError(err) {
  /* If err.request exists, then Axios is saying something went wrong reaching the URL */
  if (err.request) {
    /* err.request._currentUrl probably has a trailing slash, so accommodate for that. */
    const url =
      err.request._currentUrl.slice(-1) === '/' ? err.request._currentUrl.slice(0, -1) : err.request._currentUrl

    /* Get the name */
    const { name, group } = apps.filter(app => app.url === url)[0] || { name: '', group: '' }

    /* Return an object that resembles a successful response object */
    return {
      name,
      group,
      status: 520, // Arbitrary, higher-than-500 (but apparently used by Cloudflare)
      url: err.request._currentUrl,
    }
  }

  /* Some other error happened, so just handle it normally. */
  return Promise.reject(err)
}

module.exports = {
  interceptorSuccess,
  interceptorError,
}
