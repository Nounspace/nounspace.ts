const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { load } = require('cheerio');

function resolveTargetUrl(req) {
  if (req.query && req.query.url) {
    return decodeURIComponent(req.query.url);
  }

  try {
    const original = req.url;
    const prefix = '/api/proxy/';
    const i = original.indexOf(prefix);
    if (i !== -1) {
      const tail = original.slice(i + prefix.length);
      if (tail && !tail.startsWith('?')) {
        const qIndex = tail.indexOf('?');
        const pathPart = qIndex === -1 ? tail : tail.slice(0, qIndex);
        const searchPart = qIndex === -1 ? '' : tail.slice(qIndex);

        const parts = pathPart.split('/');
        const scheme = parts.shift();
        const host = parts.shift();
        if ((scheme === 'http' || scheme === 'https') && host) {
          const pathname = '/' + parts.join('/');
          return `${scheme}://${host}${pathname}${searchPart}`;
        }
      }
    }
  } catch {}

  try {
    const referer = req.headers.referer;
    if (referer) {
      const ref = new URL(referer);
      const parentEncoded = ref.searchParams.get('url');
      if (parentEncoded) {
        const parent = new URL(decodeURIComponent(parentEncoded));
        const current = new URL(
          req.url,
          `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`
        );
        current.searchParams.forEach((v, k) => {
          if (k !== 'url') parent.searchParams.append(k, v);
        });
        return parent.toString();
      }
    }
  } catch {}

  return null;
}

module.exports = async function handler(req, res) {
  const targetUrl = resolveTargetUrl(req);

  if (!targetUrl) {
    res.status(400).json({ error: "Missing 'url' query parameter" });
    return;
  }

  if (targetUrl.startsWith('ws:') || targetUrl.startsWith('wss:')) {
    res.status(400).json({ error: 'WebSocket protocols not supported' });
    return;
  }

  try {
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
    delete fetchHeaders['accept-encoding'];

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: fetchHeaders,
      body,
      redirect: 'follow',
    });
    const contentType = response.headers.get('content-type') || '';
    const ct = contentType.toLowerCase();
    const proxyOrigin = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`;
    const base = new URL(targetUrl);
    const prefix = `${proxyOrigin}/api/proxy/${base.protocol.replace(':', '')}/${base.host}`;
    console.log('Proxy fetch:', targetUrl, response.status, contentType);

    res.status(response.status);
    response.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (
        ['x-frame-options', 'content-security-policy', 'content-length', 'content-encoding', 'transfer-encoding'].includes(lower)
      ) {
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

    if (ct.includes('text/html')) {
      const html = await response.text();
      const rewritten = rewriteHtml(html, targetUrl, req, load);
      res.setHeader('Content-Type', contentType || 'text/html');
      res.end(rewritten);
      return;
    }

    if (ct.includes('text/css')) {
      let css = await response.text();
      css = css.replace(/url\(\s*(['"]?)\/(?!api\/proxy\/)([^'"\)]+)\1\s*\)/g, (m, q, p) => `url(${q}${prefix}/${p}${q})`);
      res.setHeader('Content-Type', contentType || 'text/css');
      res.end(css);
      return;
    }

    if (ct.includes('javascript') || ct.includes('ecmascript') || ct.includes('module')) {
      let js = await response.text();
      js = js.replace(/import\(\s*(['"])\/(?!api\/proxy\/)([^'"\)]+)\1\s*\)/g, (m, q, p) => `import(${q}${prefix}/${p}${q})`);
      js = js.replace(/(['"])\/(?!api\/proxy\/)(_next|assets|api)\/([^'"]+)\1/g, (m, q, bucket, rest) => `${q}${prefix}/${bucket}/${rest}${q}`);
      res.setHeader('Content-Type', contentType || 'application/javascript');
      res.end(js);
      return;
    }

    if (response.body) {
      if (contentType) {
        res.setHeader('Content-Type', contentType);
      }
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

  function toProxy(abs) {
    const u = new URL(abs);
    const proto = u.protocol.replace(':', '');
    return `${proxyOrigin}/api/proxy/${proto}/${u.host}${u.pathname}${u.search}${u.hash}`;
  }

  const rewriteAttr = (index, el, attr) => {
    const value = $(el).attr(attr);
    if (!value || /^(data:|javascript:|mailto:)/i.test(value)) {
      return;
    }
    try {
      const abs = new URL(value, targetUrl).toString();
      $(el).attr(attr, toProxy(abs));
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
          return `${toProxy(abs)}${descriptor ? ` ${descriptor}` : ''}`;
        } catch {
          return part;
        }
      })
      .join(', ');
    $(el).attr('srcset', rewritten);
  });

  const scriptContent = `(function(){
  const PROXY_ORIGIN=location.origin;
  const BASE=new URL(${JSON.stringify(targetUrl)});
  const PROXY_PREFIX=PROXY_ORIGIN+'/api/proxy/';
  function isAlreadyProxied(u){try{const abs=new URL(typeof u==='string'?u:u.toString(),location.href);return abs.origin===PROXY_ORIGIN&&abs.pathname.startsWith('/api/proxy/');}catch{return false;}}
  function toProxy(u){try{if(isAlreadyProxied(u))return typeof u==='string'?u:u.toString();let abs=new URL(u,BASE);if(abs.origin===PROXY_ORIGIN&&!abs.pathname.startsWith('/api/proxy/')){abs=new URL(abs.pathname+abs.search+abs.hash,BASE);}return PROXY_PREFIX+abs.protocol.replace(':','')+'/'+abs.host+abs.pathname+abs.search+abs.hash;}catch{return u;}}
  document.addEventListener('click',e=>{const a=e.target&&e.target.closest&&e.target.closest('a[href]');if(a){try{a.href=toProxy(a.getAttribute('href'));}catch{}}},true);
  document.addEventListener('submit',e=>{const f=e.target;if(!(f instanceof HTMLFormElement))return;try{const m=(f.method||'GET').toUpperCase();const actionAttr=f.getAttribute('action')||'';const actionAbs=new URL(actionAttr||'.',BASE);if(m==='GET'){e.preventDefault();const params=new URLSearchParams(new FormData(f));new URLSearchParams(actionAbs.search).forEach((v,k)=>params.append(k,v));actionAbs.search='?'+params.toString();window.location.href=toProxy(actionAbs.toString());}else{f.action=toProxy(actionAbs.toString());}}catch{}},true);
  const ofetch=window.fetch;window.fetch=function(i,o){try{let url=typeof i==='string'?i:i&&i.url;if(url){const proxied=toProxy(url);return typeof i==='string'?ofetch(proxied,o):ofetch(new Request(proxied,i),o);}}catch{}return ofetch(i,o);};
  const oopen=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u,...r){try{u=toProxy(new URL(u,BASE).toString());}catch{}return oopen.call(this,m,u,...r);};
  if(navigator.sendBeacon){const obeacon=navigator.sendBeacon.bind(navigator);navigator.sendBeacon=function(u,data){try{u=toProxy(new URL(u,BASE).toString());}catch{}return obeacon(u,data);};}
  if(window.EventSource){const OES=window.EventSource;window.EventSource=function(u,conf){try{u=toProxy(new URL(u,BASE).toString());}catch{}return new OES(u,conf);};window.EventSource.prototype=OES.prototype;}
  if(window.Worker){const OW=window.Worker;window.Worker=function(u,opts){try{u=toProxy(new URL(u,BASE).toString());}catch{}return new OW(u,opts);};window.Worker.prototype=OW.prototype;}
  if(window.SharedWorker){const OSW=window.SharedWorker;window.SharedWorker=function(u,opts){try{u=toProxy(new URL(u,BASE).toString());}catch{}return new OSW(u,opts);};window.SharedWorker.prototype=OSW.prototype;}
  if(navigator.serviceWorker&&navigator.serviceWorker.register){navigator.serviceWorker.register=function(){return Promise.resolve(undefined);};}
})();`;

  $('head').prepend(`<script>${scriptContent}</script>`);

  return $.html({ decodeEntities: false });
}
