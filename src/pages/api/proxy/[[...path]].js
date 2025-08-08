/* eslint-env node */
import fetch from 'node-fetch';
import { load } from 'cheerio';
import { Readable } from 'stream';

function pipeRawBody(resp, res, contentType) {
  if (contentType) res.setHeader('Content-Type', contentType);
  const b = resp.body;
  if (!b) {
    res.end();
    console.log('[proxy] response ended, bytes=0');
    return;
  }
  const stream = typeof b.pipe === 'function' ? b : Readable.fromWeb(b);
  stream.pipe(res);
  res.on('finish', () => console.log('[proxy] response finished'));
  res.on('close', () => console.log('[proxy] response closed'));
}

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
  } catch { /* empty */ }

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
  } catch { /* empty */ }

  return null;
}

export default async function handler(req, res) {
  console.log('[proxy] handler mounted, url=', req.url);
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

    const base = new URL(targetUrl);
    const currentUrl = new URL(
      req.url,
      `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`
    );
    const debugRaw = currentUrl.searchParams.get('__raw') === '1';
    const fetchHeaders = { ...req.headers };
    delete fetchHeaders.host;
    delete fetchHeaders['content-length'];
    delete fetchHeaders['accept-encoding'];
    try {
      fetchHeaders.origin = `${base.protocol}//${base.host}`;
      fetchHeaders.referer = targetUrl;
    } catch { /* empty */ }
    ['sec-fetch-site', 'sec-fetch-mode', 'sec-fetch-dest'].forEach((h) =>
      delete fetchHeaders[h]
    );

    const cookiePrefix = `__PXY_${base.protocol.replace(':', '')}_${base.host}__`;
    const mapIncomingCookies = (raw) => {
      if (!raw) return '';
      const parts = raw.split(/;\s*/).filter(Boolean);
      const keep = [];
      for (const p of parts) {
        const [k, ...rest] = p.split('=');
        if (k && k.startsWith(cookiePrefix)) {
          keep.push(`${k.slice(cookiePrefix.length)}=${rest.join('=')}`);
        }
      }
      return keep.join('; ');
    };
    const mapSetCookie = (val) => {
      const [nv, ...attrs] = val.split(';');
      const eq = nv.indexOf('=');
      if (eq < 0) return val;
      const name = nv.slice(0, eq).trim();
      const outParts = [`${cookiePrefix}${name}=${nv.slice(eq + 1)}`];
      let sawPath = false;
      for (let a of attrs) {
        const t = a.trim();
        if (/^domain=/i.test(t)) continue;
        if (/^path=/i.test(t)) { sawPath = true; continue; }
        outParts.push(t);
      }
      if (!sawPath)
        outParts.push(`Path=/api/proxy/${base.protocol.replace(':', '')}/${base.host}`);
      return outParts.join('; ');
    };
    if (req.headers.cookie) {
      fetchHeaders.cookie = mapIncomingCookies(req.headers.cookie);
    }

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: fetchHeaders,
      body,
      redirect: 'follow',
    });
    const contentType = response.headers.get('content-type') || '';
    const ct = contentType.toLowerCase();
    const proxyOrigin = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`;
    const prefix = `${proxyOrigin}/api/proxy/${base.protocol.replace(':', '')}/${base.host}`;
    const toProxy = (abs) => {
      const u = new URL(abs, base);
      return `${proxyOrigin}/api/proxy/${u.protocol.replace(':', '')}/${u.host}${u.pathname}${u.search}${u.hash}`;
    };
    console.log('Proxy fetch:', targetUrl, response.status, contentType);

    res.status(response.status);
    response.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (
        [
          'x-frame-options',
          'content-security-policy',
          'content-length',
          'content-encoding',
          'transfer-encoding',
          'set-cookie',
        ].includes(lower)
      ) {
        return;
      }
      res.setHeader(key, value);
    });

    const loc = response.headers.get('location');
    if (loc) {
      res.setHeader('Location', toProxy(loc));
    }

    if (response.headers.get('access-control-allow-origin')) {
      res.setHeader('Access-Control-Allow-Origin', proxyOrigin);
      res.setHeader('Vary', 'Origin');
    }
    if (response.headers.get('access-control-allow-credentials')) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    const setCookies = response.headers.raw()?.['set-cookie'];
    if (setCookies && setCookies.length) {
      res.setHeader('Set-Cookie', setCookies.map(mapSetCookie));
    }

    res.setHeader(
      'Content-Security-Policy',
      "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; frame-ancestors *"
    );

    if (!res.getHeader('Cache-Control')) {
      res.setHeader('Cache-Control', 'public, max-age=3600');
    }

    if (ct.includes('text/event-stream')) {
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('X-Accel-Buffering', 'no');
      pipeRawBody(response, res, contentType);
      return;
    }

    if (ct.includes('text/html') && debugRaw) {
      console.log('[proxy] RAW HTML passthrough enabled');
      pipeRawBody(response, res, contentType);
      return;
    }

    if (ct.includes('text/html')) {
      const html = await response.text();
      const rewritten = rewriteHtml(html, targetUrl, req, load);
      const buf = Buffer.from(rewritten, 'utf8');
      if (!res.getHeader('Content-Type')) {
        res.setHeader('Content-Type', contentType || 'text/html');
      }
      res.setHeader('Content-Length', String(buf.length));
      res.setHeader('Connection', 'close');
      if (req.method === 'HEAD') {
        res.end();
      } else {
        res.end(buf);
      }
      console.log('[proxy] response ended, bytes=', buf.length);
      return;
    }

    if (ct.includes('text/css')) {
      let css = await response.text();
      css = css.replace(/url\(\s*(['"]?)\/(?!api\/proxy\/)([^'")]+)\1\s*\)/g, (m, q, p) => `url(${q}${prefix}/${p}${q})`);
      const buf = Buffer.from(css, 'utf8');
      if (!res.getHeader('Content-Type')) {
        res.setHeader('Content-Type', contentType || 'text/css');
      }
      res.setHeader('Content-Length', String(buf.length));
      res.setHeader('Connection', 'close');
      if (req.method === 'HEAD') {
        res.end();
      } else {
        res.end(buf);
      }
      console.log('[proxy] response ended, bytes=', buf.length);
      return;
    }

    if (ct.includes('javascript') || ct.includes('ecmascript') || ct.includes('module')) {
      let js = await response.text();
      js = js.replace(/import\(\s*(['"])\/(?!api\/proxy\/)([^'")]+)\1\s*\)/g, (m, q, p) => `import(${q}${prefix}/${p}${q})`);
      js = js.replace(/new\s+URL\(\s*(['"])\/(?!api\/proxy\/)([^'")]+)\1\s*,\s*import\.meta\.url\s*\)/g, (m, q, p) => `new URL(${q}${prefix}/${p}${q}, import.meta.url)`);
      js = js.replace(/(__webpack_require__\.p\s*=\s*)(['"])\/(?!api\/proxy\/)/g, (m, pre, q) => `${pre}${q}${prefix}/`);
      js = js.replace(/(['"])\/(?!api\/proxy\/)(_next|assets|api|static|build|dist|_nuxt)\/([^'"]+)\1/g, (m, q, bucket, rest) => `${q}${prefix}/${bucket}/${rest}${q}`);
      const buf = Buffer.from(js, 'utf8');
      if (!res.getHeader('Content-Type')) {
        res.setHeader('Content-Type', contentType || 'application/javascript');
      }
      res.setHeader('Content-Length', String(buf.length));
      res.setHeader('Connection', 'close');
      if (req.method === 'HEAD') {
        res.end();
      } else {
        res.end(buf);
      }
      console.log('[proxy] response ended, bytes=', buf.length);
      return;
    }

    if (req.method === 'HEAD') {
      if (contentType) res.setHeader('Content-Type', contentType);
      res.setHeader('Connection', 'close');
      res.end();
      console.log('[proxy] response ended, bytes=0');
      return;
    }
    pipeRawBody(response, res, contentType);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch the requested site' });
  }
}

function rewriteHtml(html, targetUrl, req, load) {
  const $ = load(html, { decodeEntities: false });

  const proxyOrigin = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`;

  let baseHref = $('base[href]').attr('href');
  if (baseHref) {
    try { targetUrl = new URL(baseHref, targetUrl).toString(); } catch { /* empty */ }
  }

  $('link[integrity]').removeAttr('integrity');
  $('script[integrity]').removeAttr('integrity');

  function toProxy(abs) {
    const u = new URL(abs);
    const proto = u.protocol.replace(':', '');
    return `${proxyOrigin}/api/proxy/${proto}/${u.host}${u.pathname}${u.search}${u.hash}`;
  }

  const rewriteAttr = (index, el, attr) => {
    const value = $(el).attr(attr);
    if (!value || /^(?:|#|data:|javascript:|mailto:)/i.test(value)) {
      return;
    }
    try {
      const abs = new URL(value, targetUrl).toString();
      const proxied = toProxy(abs);
      if (proxied !== value) $(el).attr(attr, proxied);
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
    if (rewritten !== srcset) $(el).attr('srcset', rewritten);
  });

  /* eslint-disable no-useless-escape */
  const scriptContent = `(function(){
  if(window.__NS_PROXY_INSTALLED__)return;window.__NS_PROXY_INSTALLED__=true;
  const PROXY_ORIGIN=location.origin;
  const BASE=new URL(${JSON.stringify(targetUrl)});
  const PROXY_PREFIX=PROXY_ORIGIN+'/api/proxy/';
  const NOOP_RE=/^(?:|#|javascript:|mailto:|data:)/i;
  function isAlreadyProxied(u){try{const abs=new URL(typeof u==='string'?u:u.toString(),location.href);return abs.origin===PROXY_ORIGIN&&abs.pathname.startsWith('/api/proxy/');}catch{return false;}}
  function toProxy(u){try{if(!u||NOOP_RE.test(String(u)))return u;if(isAlreadyProxied(u))return u;let abs=new URL(u,BASE);if(abs.origin===PROXY_ORIGIN&&!abs.pathname.startsWith('/api/proxy/')){abs=new URL(abs.pathname+abs.search+abs.hash,BASE);}return PROXY_PREFIX+abs.protocol.replace(':','')+'/'+abs.host+abs.pathname+abs.search+abs.hash;}catch{return u;}}
  function rewriteEl(el){if(!el||!el.getAttribute)return;const ATTRS=['src','href','srcset','action'];for(const a of ATTRS){const v=el.getAttribute(a);if(!v||NOOP_RE.test(v))continue;try{if(a==='srcset'){const parts=v.split(',').map(s=>s.trim()).filter(Boolean);const next=parts.map(p=>{const [u,d]=p.split(/\s+/,2);if(!u||NOOP_RE.test(u))return p;const nu=toProxy(u);return nu&&nu!==u?(d?nu+' '+d:nu):p;}).join(', ');if(next&&next!==v)el.setAttribute(a,next);}else{const nv=toProxy(v);if(nv&&nv!==v)el.setAttribute(a,nv);}}catch{}}}
  document.addEventListener('click',e=>{const a=e.target&&e.target.closest&&e.target.closest('a[href]');if(!a)return;try{const v=a.getAttribute('href');const nv=toProxy(v);if(nv&&nv!==v)a.href=nv;}catch{}},true);
  document.addEventListener('submit',e=>{const f=e.target;if(!(f instanceof HTMLFormElement))return;try{const m=(f.method||'GET').toUpperCase();const actionAttr=f.getAttribute('action')||'';const actionAbs=new URL(actionAttr||'.',BASE);if(m==='GET'){e.preventDefault();const params=new URLSearchParams(new FormData(f));new URLSearchParams(actionAbs.search).forEach((v,k)=>params.append(k,v));actionAbs.search='?'+params.toString();const u=toProxy(actionAbs.toString());if(u&&u!==location.href)location.href=u;}else{const u=toProxy(actionAbs.toString());if(u&&u!==f.action)f.action=u;}}catch{}},true);
  const ofetch=window.fetch;window.fetch=function(i,o){try{let url=typeof i==='string'?i:i&&i.url;if(url&&!NOOP_RE.test(url)){const proxied=toProxy(url);return typeof i==='string'?ofetch(proxied,o):ofetch(new Request(proxied,i),o);}}catch{}return ofetch(i,o);};
  const oopen=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u,...r){try{if(u&&!NOOP_RE.test(u))u=toProxy(new URL(u,BASE).toString());}catch{}return oopen.call(this,m,u,...r);};
  if(navigator.sendBeacon){const obeacon=navigator.sendBeacon.bind(navigator);navigator.sendBeacon=function(u,data){try{if(u&&!NOOP_RE.test(u))u=toProxy(new URL(u,BASE).toString());}catch{}return obeacon(u,data);};}
  if(window.EventSource){const OES=window.EventSource;window.EventSource=function(u,conf){try{if(u&&!NOOP_RE.test(u))u=toProxy(new URL(u,BASE).toString());}catch{}return new OES(u,conf);};window.EventSource.prototype=OES.prototype;}
  if(window.Worker){const OW=window.Worker;window.Worker=function(u,opts){try{if(u&&!NOOP_RE.test(u))u=toProxy(new URL(u,BASE).toString());}catch{}return new OW(u,opts);};window.Worker.prototype=OW.prototype;}
  if(window.SharedWorker){const OSW=window.SharedWorker;window.SharedWorker=function(u,opts){try{if(u&&!NOOP_RE.test(u))u=toProxy(new URL(u,BASE).toString());}catch{}return new OSW(u,opts);};window.SharedWorker.prototype=OSW.prototype;}
  if(navigator.serviceWorker&&navigator.serviceWorker.register){navigator.serviceWorker.register=function(){return Promise.resolve(undefined);};}
  const mo=new MutationObserver(muts=>{for(const m of muts){if(m.type==='childList'&&m.addedNodes){m.addedNodes.forEach(rewriteEl);}else if(m.type==='attributes'&&m.target){rewriteEl(m.target);}}});
  mo.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src','href','srcset','action'],attributeOldValue:true});
  const _push=history.pushState.bind(history);history.pushState=function(s,t,u){if(u!=null){const nu=toProxy(u);if(nu&&nu!==location.href)return _push(s,t,nu);}return _push(s,t,u);};
  const _replace=history.replaceState.bind(history);history.replaceState=function(s,t,u){if(u!=null){const nu=toProxy(u);if(nu&&nu!==location.href)return _replace(s,t,nu);}return _replace(s,t,u);};
  const _assign=location.assign.bind(location);location.assign=function(u){const nu=toProxy(u);if(nu&&nu!==location.href)return _assign(nu);};
  const _replaceLoc=location.replace.bind(location);location.replace=function(u){const nu=toProxy(u);if(nu&&nu!==location.href)return _replaceLoc(nu);};
})();`;
  /* eslint-enable no-useless-escape */

  if ($('head').length === 0) $('html').prepend('<head></head>');
  if (!$('#ns-proxy-runtime').length) {
    $('head').prepend(`<script id="ns-proxy-runtime">${scriptContent}</script>`);
  }

  return $.html({ decodeEntities: false });
}

export const config = { api: { bodyParser: false, externalResolver: true } };

