const fetch = require('node-fetch');
const { load } = require('cheerio');

module.exports = async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    res.status(400).json({ error: "Missing 'url' query parameter" });
    return;
  }

  try {
    const targetUrl = decodeURIComponent(url);

    let body;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      body = await new Promise((resolve, reject) => {
        const chunks = [];
        req.on('data', (chunk) => chunks.push(chunk));
        req.on('end', () => resolve(Buffer.concat(chunks)));
        req.on('error', reject);
      });
    }

    const fetchHeaders = { ...req.headers };
    delete fetchHeaders.host;
    delete fetchHeaders['content-length'];

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: fetchHeaders,
      body,
      redirect: 'follow',
      compress: false,
    });

    res.status(response.status);
    response.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (['x-frame-options', 'content-security-policy'].includes(lower)) {
        return;
      }
      res.setHeader(key, value);
    });

    res.setHeader('X-Frame-Options', 'ALLOW-FROM *');
    res.setHeader(
      'Content-Security-Policy',
      "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; img-src * data: blob:; media-src * data: blob:; style-src * 'unsafe-inline' data: blob:; script-src * 'unsafe-inline' 'unsafe-eval' data: blob:; font-src * data:; connect-src * data: blob:; frame-src *; frame-ancestors *"
    );

    if (!res.getHeader('Cache-Control')) {
      res.setHeader('Cache-Control', 'public, max-age=3600');
    }

    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('text/html')) {
      const html = await response.text();
      const rewritten = rewriteHtml(html, targetUrl, req, load);
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Length', Buffer.byteLength(rewritten));
      res.end(rewritten);
    } else if (response.body) {
      response.body.pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch the requested site' });
  }
};

function rewriteHtml(html, targetUrl, req, load) {
  const $ = load(html, { decodeEntities: false });

  const proxyOrigin = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`;
  const proxyBase = `${proxyOrigin}/api/proxy?url=`;

  const rewriteAttr = (index, el, attr) => {
    const value = $(el).attr(attr);
    if (!value || /^(data:|javascript:|mailto:)/i.test(value)) {
      return;
    }
    try {
      const abs = new URL(value, targetUrl).toString();
      $(el).attr(attr, `${proxyBase}${encodeURIComponent(abs)}`);
    } catch {
      /* ignore */
    }
  };

  $('a[href]').each((i, el) => rewriteAttr(i, el, 'href'));
  $('form[action]').each((i, el) => rewriteAttr(i, el, 'action'));
  $('[src]').each((i, el) => rewriteAttr(i, el, 'src'));
  $('link[href]').each((i, el) => rewriteAttr(i, el, 'href'));

  $('[srcset]').each((i, el) => {
    const srcset = $(el).attr('srcset');
    if (!srcset) return;
    const rewritten = srcset
      .split(',')
      .map((part) => {
        const [u, descriptor] = part.trim().split(/\s+/, 2);
        if (!u || /^(data:|javascript:|mailto:)/i.test(u)) {
          return part;
        }
        try {
          const abs = new URL(u, targetUrl).toString();
          return `${proxyBase}${encodeURIComponent(abs)}${descriptor ? ` ${descriptor}` : ''}`;
        } catch {
          return part;
        }
      })
      .join(', ');
    $(el).attr('srcset', rewritten);
  });

  const scriptContent = `(function(){const p=${JSON.stringify(proxyBase)};function r(u){try{const a=new URL(u, window.location.href);return p+encodeURIComponent(a.toString());}catch(e){return u;}}document.addEventListener('click',e=>{const t=e.target.closest('a');if(t&&t.href){t.href=r(t.href);}});document.addEventListener('submit',e=>{const f=e.target;if(f&&f.action){f.action=r(f.action);}});const ofetch=window.fetch;window.fetch=function(i,o){if(typeof i==='string'){i=r(i);}else if(i instanceof Request){i=new Request(r(i.url),i);}return ofetch(i,o);};const oopen=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){return oopen.call(this,m,r(u),...Array.prototype.slice.call(arguments,2));};})();`;

  $('body').append(`<script>${scriptContent}</script>`);

  return $.html({ decodeEntities: false });
}
