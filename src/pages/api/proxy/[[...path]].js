/* eslint-env node */
import fetch from 'node-fetch';
import { load } from 'cheerio';
import { Readable, pipeline as nodePipeline } from 'stream';
import { promisify } from 'util';

const pipeline = promisify(nodePipeline);

function lowerKeys(o) {
  const out = {};
  for (const k in o) out[k.toLowerCase()] = o[k];
  return out;
}

function stripConditionalAndRangeHeaders(h) {
  const drop = [
    'if-none-match',
    'if-modified-since',
    'if-match',
    'if-unmodified-since',
    'if-range',
    'range',
  ];
  for (const k of drop) delete h[k];
}

function shouldRewriteByPathOrCT(pathname, ct) {
  const p = pathname.toLowerCase();
  const c = (ct || '').toLowerCase();
  if (c.includes('text/html')) return true;
  if (c.includes('javascript') || c.includes('ecmascript') || c.includes('module'))
    return true;
  if (c.includes('text/css')) return true;
  if (/\.(m?js|css|html?)($|\?)/i.test(p)) return true;
  return false;
}

async function refetchUncached(method, url, headers) {
  const h = { ...headers };
  stripConditionalAndRangeHeaders(h);
  h['cache-control'] = 'no-cache';
  return fetch(url, { method, headers: h, redirect: 'follow' });
}

function guessContentType(urlPath, upstreamCT) {
  const ct = (upstreamCT || '').toLowerCase();
  if (ct && !/^(text\/plain|application\/octet-stream)$/.test(ct)) return upstreamCT;
  const q = urlPath.split('?')[0];
  if (q.endsWith('.css')) return 'text/css; charset=utf-8';
  if (q.endsWith('.mjs') || q.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if (q.endsWith('.json')) return 'application/json; charset=utf-8';
  if (q.endsWith('.svg')) return 'image/svg+xml';
  if (q.endsWith('.png')) return 'image/png';
  if (q.endsWith('.gif')) return 'image/gif';
  if (q.endsWith('.jpg') || q.endsWith('.jpeg')) return 'image/jpeg';
  if (q.endsWith('.webp')) return 'image/webp';
  if (q.endsWith('.woff2')) return 'font/woff2';
  if (q.endsWith('.woff')) return 'font/woff';
  if (q.endsWith('.ttf')) return 'font/ttf';
  if (q.endsWith('.ico')) return 'image/x-icon';
  if (q.endsWith('.wasm')) return 'application/wasm';
  if (q.endsWith('.map')) return 'application/json';
  return upstreamCT || 'application/octet-stream';
}

async function pipeRawBody(resp, res, contentType) {
  if (contentType && !res.getHeader('Content-Type')) res.setHeader('Content-Type', contentType);
  const b = resp.body;
  if (!b) {
    res.end();
    return;
  }
  const stream = typeof b.pipe === 'function' ? b : Readable.fromWeb(b);
  try {
    await pipeline(stream, res);
  } catch (err) {
    console.warn('[proxy] stream pipeline error', err?.message || err);
    try {
      if (!res.headersSent) res.statusCode = 502;
    } catch { /* empty */ }
    try { res.end(); } catch { /* empty */ }
  }
}

async function handleNextImage(req, targetUrl, fetchHeaders, res) {
  const u = new URL(targetUrl);
  if (!u.pathname.includes('/_next/image')) return false;

  const method = req.method === 'HEAD' ? 'HEAD' : 'GET';
  const paramUrl = u.searchParams.get('url');
  if (!paramUrl) return false;

  const baseHeaders = { ...fetchHeaders };
  stripConditionalAndRangeHeaders(baseHeaders);
  baseHeaders.accept = 'image/avif,image/webp,image/*;q=0.8,*/*;q=0.5';

  const copyImgCaching = (r) =>
    ['cache-control', 'etag', 'last-modified', 'expires'].forEach((k) => {
      const v = r.headers.get(k);
      if (v != null) res.setHeader(k, v);
    });

  try {
    const r1 = await fetch(targetUrl, {
      method,
      headers: baseHeaders,
      redirect: 'follow',
    });
    const ct1 = r1.headers.get('content-type') || '';
    if (r1.ok && /^image\//i.test(ct1) && r1.status !== 304 && r1.status !== 206) {
      res.status(r1.status);
      copyImgCaching(r1);
      await pipeRawBody(r1, res, ct1);
      return true;
    }
  } catch {
    /* ignore */
  }

  try {
    const direct = new URL(paramUrl, u.origin).toString();
    const r2 = await fetch(direct, {
      method,
      headers: baseHeaders,
      redirect: 'follow',
    });
    const ct2 = guessContentType(direct, r2.headers.get('content-type') || '');
    res.status(r2.status);
    copyImgCaching(r2);
    await pipeRawBody(r2, res, ct2);
    return true;
  } catch {
    /* ignore */
  }

  return false;
}

function extractParentFromReferer(req) {
  try {
    const ref = new URL(req.headers.referer || '');
    const path = ref.pathname || '';
    if (path.startsWith('/api/proxy/')) {
      const tail = path.slice('/api/proxy/'.length);
      const parts = tail.split('/');
      const scheme = parts.shift();
      const host = parts.shift();
      if ((scheme === 'http' || scheme === 'https') && host) {
        const parentPath = '/' + parts.join('/');
        const parentAbs = `${scheme}://${host}${parentPath}${ref.search}`;
        return new URL(
          decodeURIComponent(ref.searchParams.get('url') || parentAbs)
        );
      }
    }
    const enc = ref.searchParams.get('url');
    if (enc) return new URL(decodeURIComponent(enc));
  } catch {
    /* empty */
  }
  return null;
}

function extractParentFromCookie(req) {
  try {
    const raw = req.headers.cookie || '';
    const m = raw.match(/(?:^|;\s*)__ns_pxy_ctx=([^;]+)/);
    if (!m) return null;
    const [proto, host] = decodeURIComponent(m[1]).split('|');
    if (!proto || !host) return null;
    return new URL(`${proto}://${host}/`);
  } catch {
    return null;
  }
}

function resolveTargetUrl(req) {
  if (req.query && req.query.url) {
    try {
      return decodeURIComponent(req.query.url);
    } catch {
      /* empty */
    }
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
  } catch {
    /* empty */
  }

  try {
    const current = new URL(
      req.url,
      `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`
    );
    const rel = current.searchParams.get('__rel');
    const ctx = current.searchParams.get('__ctx');
    const parentFromCtx = ctx
      ? new URL(`${ctx.split('|')[0]}://${ctx.split('|')[1]}/`)
      : extractParentFromCookie(req);
    if (rel && parentFromCtx) {
      return new URL(rel, parentFromCtx).toString();
    }
  } catch {
    /* empty */
  }

  try {
    const parent = extractParentFromReferer(req) || extractParentFromCookie(req);
    if (parent) {
      const currAbs = new URL(
        req.url,
        `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`
      );
      const relPathAndQuery = currAbs.pathname + currAbs.search + currAbs.hash;
      return new URL(relPathAndQuery, parent).toString();
    }
  } catch {
    /* empty */
  }

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
    Object.assign(fetchHeaders, lowerKeys(fetchHeaders));
    stripConditionalAndRangeHeaders(fetchHeaders);
    delete fetchHeaders['accept-encoding'];
    delete fetchHeaders['host'];
    delete fetchHeaders['content-length'];
    try {
      fetchHeaders.origin = `${base.protocol}//${base.host}`;
      fetchHeaders.referer = targetUrl;
    } catch { /* empty */ }
    ['sec-fetch-site', 'sec-fetch-mode', 'sec-fetch-dest'].forEach((h) =>
      delete fetchHeaders[h]
    );
    fetchHeaders['x-forwarded-proto'] = base.protocol.replace(':', '');
    fetchHeaders['x-forwarded-host'] = base.host;
    fetchHeaders['x-forwarded-for'] =
      req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';

    const pathLower = base.pathname.toLowerCase();
    if (/\.(avif|webp|png|jpe?g|gif|svg|ico)$/.test(pathLower)) {
      fetchHeaders.accept =
        'image/avif,image/webp,image/*;q=0.8,*/*;q=0.5';
    }

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

    if (await handleNextImage(req, targetUrl, fetchHeaders, res)) return;

    let response = await fetch(targetUrl, {
      method: req.method,
      headers: fetchHeaders,
      body,
      redirect: 'follow',
    });

    const initialCT = response.headers.get('content-type') || '';
    const willRewrite = shouldRewriteByPathOrCT(base.pathname, initialCT);
    if (willRewrite && (response.status === 304 || response.status === 206)) {
      response = await refetchUncached(
        req.method === 'HEAD' ? 'HEAD' : 'GET',
        targetUrl,
        fetchHeaders
      );
    }

    const upstreamCT = response.headers.get('content-type') || '';
    const pathForCT = base.pathname + base.search;
    const contentType = guessContentType(pathForCT, upstreamCT);
    const ct = contentType.toLowerCase();

    if (
      (response.status === 403 || response.status === 503) &&
      (response.headers.get('server') || '').toLowerCase().includes('cloudflare')
    ) {
      const text = await response.text();
      if (/cdn-cgi\/challenge-platform/i.test(text)) {
        const message = `<html><body><p>Unable to proxy this site (Cloudflare protection). <a href="${targetUrl}" target="_blank" rel="noopener noreferrer">Open directly</a></p></body></html>`;
        const buf = Buffer.from(message, 'utf8');
        res.status(502);
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Content-Length', String(buf.length));
        res.end(buf);
        console.log('[proxy] cloudflare challenge');
        return;
      }
      // serve body even if no challenge pattern
      const buf = Buffer.from(text, 'utf8');
      res.status(response.status);
      if (contentType) res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', String(buf.length));
      res.end(buf);
      console.log('[proxy] response ended, bytes=', buf.length);
      return;
    }
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
          'x-content-type-options',
          'etag',
          'last-modified',
          'content-range',
          'accept-ranges',
          'age',
          'vary',
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
      res.status(response.status);
      await pipeRawBody(response, res, contentType);
      return;
    }

    if (ct.includes('text/html') && debugRaw) {
      console.log('[proxy] RAW HTML passthrough enabled');
      res.status(response.status);
      await pipeRawBody(response, res, contentType);
      return;
    }

    if (ct.includes('text/html')) {
      const html = await response.text();
      const rewritten = rewriteHtml(html, targetUrl, req, load);
      const buf = Buffer.from(rewritten, 'utf8');
      if (!res.getHeader('Content-Type')) {
        res.setHeader('Content-Type', contentType || 'text/html');
      }
      const ctxCookie = `__ns_pxy_ctx=${encodeURIComponent(base.protocol.replace(':','') + '|' + base.host)}; Path=/; SameSite=Lax; Secure`;
      const existing = res.getHeader('Set-Cookie');
      if (existing) {
        const arr = Array.isArray(existing) ? existing : [existing];
        res.setHeader('Set-Cookie', [...arr, ctxCookie]);
      } else {
        res.setHeader('Set-Cookie', ctxCookie);
      }
      res.setHeader('Content-Length', String(buf.length));
      ['etag','last-modified','content-range','accept-ranges','age','vary'].forEach((h) =>
        res.removeHeader(h)
      );
      res.setHeader('Cache-Control', 'no-store, no-transform');
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
      css = css.replace(/url\(\s*(['"]?)(\/(?!api\/proxy\/)[^'")]+)\1\s*\)/g, (m, q, p) => `url(${q}${prefix}/${p.slice(1)}${q})`);
      css = css.replace(/@import\s+(?:url\(\s*(['"]?)(\/(?!api\/proxy\/)[^'")]+)\1\s*\)|(['"])(\/(?!api\/proxy\/)[^'"]+)\3)/g, (_m, _q1, p1, _q2, p2) => `@import url("${prefix}/${(p1 || p2).slice(1)}")`);
      const buf = Buffer.from(css, 'utf8');
      if (!res.getHeader('Content-Type')) {
        res.setHeader('Content-Type', contentType || 'text/css');
      }
      res.setHeader('Content-Length', String(buf.length));
      ['etag','last-modified','content-range','accept-ranges','age','vary'].forEach((h) =>
        res.removeHeader(h)
      );
      res.setHeader('Cache-Control', 'no-store, no-transform');
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
      js = js.replace(/(`)\/(?!api\/proxy\/)(_next|assets|api|static|build|dist|_nuxt)\/([^`]+?)\1/g, (m, bt, bucket, rest) => `${bt}${prefix}/${bucket}/${rest}${bt}`);
      const jsShim = `;(function(g){if(g.__NS_PROXY_BOOTSTRAP__)return;g.__NS_PROXY_BOOTSTRAP__=true;var NOOP_RE=/^(?:|#|javascript:|mailto:|data:|blob:)/i;function toProxy(u){try{if(!u||NOOP_RE.test(String(u)))return u;var abs=new URL(u,(typeof location!=='undefined'&&location.href)?location.href:(typeof self!=='undefined'&&self.location?self.location.href:'${targetUrl}'));return '${proxyOrigin}/api/proxy/'+abs.protocol.replace(':','')+'/'+abs.host+abs.pathname+abs.search+abs.hash;}catch{return u;}}var ofetch=g.fetch;if(ofetch)g.fetch=function(i,o){try{var url=(typeof i==='string')?i:(i&&i.url)||(i&&i.href)||String(i);if(url){var p=toProxy(url);if(typeof i==='string')return ofetch(p,o);var req=(typeof Request!=='undefined'&&i instanceof Request)?new Request(p,i):new Request(p,o);return ofetch(req,o);}}catch{}return ofetch(i,o);};if(g.XMLHttpRequest){var oopen=g.XMLHttpRequest.prototype.open;g.XMLHttpRequest.prototype.open=function(m,u){try{if(u&&!NOOP_RE.test(u))u=toProxy(u);}catch{}return oopen.apply(this,arguments);};}})(typeof globalThis!=='undefined'?globalThis:this);`;
      js = jsShim + '\n' + js;
      const buf = Buffer.from(js, 'utf8');
      if (!res.getHeader('Content-Type')) {
        res.setHeader('Content-Type', contentType || 'application/javascript');
      }
      res.setHeader('Content-Length', String(buf.length));
      ['etag','last-modified','content-range','accept-ranges','age','vary'].forEach((h) =>
        res.removeHeader(h)
      );
      res.setHeader('Cache-Control', 'no-store, no-transform');
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
      res.end();
      console.log('[proxy] response ended, bytes=0');
      return;
    }
    await pipeRawBody(response, res, contentType);
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

  if (baseHref) {
    $('base[href]').attr('href', toProxy(targetUrl));
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

  // meta refresh URLs
  $('meta[http-equiv="refresh"][content]').each((i, el) => {
    const content = $(el).attr('content');
    const m = content.match(/(.*?url=)([^;]+)(.*)/i);
    if (m) {
      try {
        const abs = new URL(m[2].trim(), targetUrl).toString();
        $(el).attr('content', `${m[1]}${toProxy(abs)}${m[3]}`);
      } catch { /* empty */ }
    }
  });

  /* eslint-disable no-useless-escape */
  const scriptContent = `(function(){
    if(window.__NS_PROXY_INSTALLED__)return;window.__NS_PROXY_INSTALLED__=true;
    const PROXY_ORIGIN=location.origin;
    const SERVER_BASE=new URL(${JSON.stringify(targetUrl)});
    function currentBase(){
      try{
        var b=new URL(location.href);
        if(b.origin===PROXY_ORIGIN&&b.pathname.startsWith('/api/proxy/')){
          var p=b.pathname.slice(11).split('/');
          var sc=p.shift();
          var h=p.shift();
          if(sc&&h){
            var rest=p.join('/');
            return new URL(sc+'://'+h+(rest?'/' + rest:''));
          }
        }
        return b;
      }catch{return SERVER_BASE;}
    }
    const PROXY_PREFIX=PROXY_ORIGIN+'/api/proxy/';
    const NOOP_RE=/^(?:|#|javascript:|mailto:|data:|blob:)/i;
    function isAlreadyProxied(u){try{const abs=new URL(typeof u==='string'?u:u.toString(),location.href);return abs.origin===PROXY_ORIGIN&&abs.pathname.startsWith('/api/proxy/');}catch{return false;}}
    function toProxy(u){try{if(!u||NOOP_RE.test(String(u)))return u;if(isAlreadyProxied(u))return u;let abs=new URL(u,currentBase());if(abs.origin===PROXY_ORIGIN&&!abs.pathname.startsWith('/api/proxy/')){abs=new URL(abs.pathname+abs.search+abs.hash,currentBase());}return PROXY_PREFIX+abs.protocol.replace(':','')+'/'+abs.host+abs.pathname+abs.search+abs.hash;}catch{return u;}}
    function rewriteSrcset(v){return v.split(',').map(p=>{const t=p.trim();if(!t)return'';const [u,d]=t.split(/\s+/,2);if(!u||NOOP_RE.test(u))return p;const nu=toProxy(u);return nu&&nu!==u?(d?nu+' '+d:nu):p;}).join(', ');}
    const URL_ATTRS=new Set(['src','href','action','poster','srcset']);
    const _setAttribute=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n,v){try{if(URL_ATTRS.has(n)){if(n==='srcset')v=rewriteSrcset(v);else if(v&&!NOOP_RE.test(v))v=toProxy(v);}}catch{}return _setAttribute.call(this,n,v);};
    function patchProp(C,p){const d=Object.getOwnPropertyDescriptor(C.prototype,p);if(!d||!d.set)return;Object.defineProperty(C.prototype,p,{configurable:d.configurable,enumerable:d.enumerable,get:d.get?function(){return d.get.call(this);}:undefined,set:function(v){try{if(p==='srcset')v=rewriteSrcset(v);else if(v&&!NOOP_RE.test(v))v=toProxy(v);}catch{}return d.set.call(this,v);}});}
    [[HTMLAnchorElement,'href'],[HTMLLinkElement,'href'],[HTMLImageElement,'src'],[HTMLScriptElement,'src'],[HTMLIFrameElement,'src'],[HTMLSourceElement,'src'],[HTMLMediaElement,'src'],[HTMLVideoElement,'poster'],[HTMLFormElement,'action']].forEach(([C,p])=>{try{patchProp(C,p);}catch{}});
    function rewriteEl(el){if(!el||!el.getAttribute)return;URL_ATTRS.forEach(a=>{const v=el.getAttribute(a);if(!v||NOOP_RE.test(v))return;try{if(a==='srcset'){const next=rewriteSrcset(v);if(next&&next!==v)el.setAttribute(a,next);}else{const nv=toProxy(v);if(nv&&nv!==v)el.setAttribute(a,nv);}}catch{}});}
    function rewriteTree(r){try{rewriteEl(r);if(r.querySelectorAll)r.querySelectorAll('[src],[href],[action],[poster],[srcset]').forEach(rewriteEl);}catch{}}
      function rewriteHtmlStringOnce(html){try{html=html.replace(/\b(src|href|action|poster)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>\`]+))/gi,(m,attr,quoted,dq,sq,bare)=>{const val=dq??sq??bare;if(!val)return m;try{const nv=toProxy(val);if(!nv||nv===val)return m;const q=quoted?.[0]||'"';return attr + '=' + q + nv + q;}catch{return m;}}).replace(/\bsrcset\s*=\s*("([^"]*)"|'([^']*)')/gi,(m,quoted,dq,sq)=>{const val=dq??sq??'';const next=val.split(',').map(p=>{const t=p.trim();if(!t)return t;const[u,d]=t.split(/\s+/,2);try{const nu=toProxy(u);return nu&&nu!==u?(d?nu+' '+d:nu):p;}catch{return p;}}).join(', ');const q=quoted?.[0]||'"';return 'srcset=' + q + next + q;});}catch{}return html;}
    const _appendChild=Node.prototype.appendChild;Node.prototype.appendChild=function(n){try{rewriteTree(n);}catch{}return _appendChild.call(this,n);};
    const _insertBefore=Node.prototype.insertBefore;Node.prototype.insertBefore=function(n,r){try{rewriteTree(n);}catch{}return _insertBefore.call(this,n,r);};
    const _replaceChild=Node.prototype.replaceChild;Node.prototype.replaceChild=function(n,o){try{rewriteTree(n);}catch{}return _replaceChild.call(this,n,o);};
    ['append','prepend','before','after','replaceWith'].forEach(m=>{const orig=Element.prototype[m];if(!orig)return;Element.prototype[m]=function(...nodes){try{nodes.forEach(x=>{if(typeof x!=='string')rewriteTree(x);});}catch{}return orig.apply(this,nodes);};});
    const _insertAdjacentElement=Element.prototype.insertAdjacentElement;Element.prototype.insertAdjacentElement=function(pos,el){try{rewriteTree(el);}catch{}return _insertAdjacentElement.call(this,pos,el);};
    const _insertAdjacentHTML=Element.prototype.insertAdjacentHTML;Element.prototype.insertAdjacentHTML=function(pos,html){try{html=rewriteHtmlStringOnce(html);}catch{}return _insertAdjacentHTML.call(this,pos,html);};
    const _write=Document.prototype.write;const _writeln=Document.prototype.writeln;function rewriteThen(fn,args){try{const html=Array.prototype.join.call(args,'');return fn.call(document,rewriteHtmlStringOnce(html));}catch{return fn.apply(document,args);}}Document.prototype.write=function(...a){return rewriteThen(_write,a);};Document.prototype.writeln=function(...a){return rewriteThen(_writeln,a);};
    document.addEventListener('click',function(e){if(e.defaultPrevented)return;if(e.metaKey||e.ctrlKey||e.shiftKey||e.button!==0)return;const a=e.target&&e.target.closest&&e.target.closest('a[href]');if(!a)return;if(a.target&&a.target!=='_self')return;if(a.hasAttribute('download'))return;try{const v=a.getAttribute('href');const nu=toProxy(v);if(nu&&nu!==v){e.preventDefault();if(window.top!==window){try{parent.postMessage({__ns_proxy_nav__:nu},'*');}catch{}}else{location.assign(nu);}}}catch{}},true);
    document.addEventListener('submit',e=>{const f=e.target;if(!(f instanceof HTMLFormElement))return;try{const m=(f.method||'GET').toUpperCase();const actionAttr=f.getAttribute('action')||'';const actionAbs=new URL(actionAttr||'.',currentBase());if(m==='GET'){e.preventDefault();const params=new URLSearchParams(new FormData(f));new URLSearchParams(actionAbs.search).forEach((v,k)=>params.append(k,v));actionAbs.search='?'+params.toString();const u=toProxy(actionAbs.toString());if(u&&u!==location.href){if(window.top!==window){try{parent.postMessage({__ns_proxy_nav__:u},'*');}catch{}}else{location.href=u;}}}else{const u=toProxy(actionAbs.toString());if(u&&u!==f.action)f.action=u;}}catch{}},true);
    const ORequest=window.Request;window.Request=new Proxy(ORequest,{construct(target,args){try{const input=args[0];let u=typeof input==='string'?input:(input&&input.url)||(input&&input.href)||String(input);if(u)args[0]=toProxy(u);}catch{}return new target(...args);}});
    const ofetch=window.fetch;function wrappedFetch(i,o){try{let u=typeof i==='string'?i:(i&&i.url)||(i&&i.href)||String(i);if(u){const p=toProxy(u);if(typeof i==='string')return ofetch(p,o);const req=i instanceof Request?new Request(p,i):new Request(p,o);return ofetch(req,o);}}catch{}return ofetch(i,o);}window.fetch=wrappedFetch;try{Object.defineProperty(window,'fetch',{configurable:true,get(){return wrappedFetch;},set(){}});}catch{}
    const oopen=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u,...r){try{if(u&&!NOOP_RE.test(u))u=toProxy(new URL(u,currentBase()).toString());}catch{}return oopen.call(this,m,u,...r);};
    if(navigator.sendBeacon){const obeacon=navigator.sendBeacon.bind(navigator);navigator.sendBeacon=function(u,data){try{if(u&&!NOOP_RE.test(u))u=toProxy(new URL(u,currentBase()).toString());}catch{}return obeacon(u,data);};}
    if(window.EventSource){const OES=window.EventSource;window.EventSource=function(u,conf){try{if(u&&!NOOP_RE.test(u))u=toProxy(new URL(u,currentBase()).toString());}catch{}return new OES(u,conf);};window.EventSource.prototype=OES.prototype;}
    if(window.Worker){const OW=window.Worker;window.Worker=function(u,opts){try{if(u&&!NOOP_RE.test(u))u=toProxy(new URL(u,currentBase()).toString());}catch{}return new OW(u,opts);};window.Worker.prototype=OW.prototype;}
    if(window.SharedWorker){const OSW=window.SharedWorker;window.SharedWorker=function(u,opts){try{if(u&&!NOOP_RE.test(u))u=toProxy(new URL(u,currentBase()).toString());}catch{}return new OSW(u,opts);};window.SharedWorker.prototype=OSW.prototype;}
    if(navigator.serviceWorker&&navigator.serviceWorker.register){navigator.serviceWorker.register=function(){return Promise.resolve(undefined);};}
    const mo=new MutationObserver(ms=>{for(const m of ms){if(m.type==='childList'&&m.addedNodes){m.addedNodes.forEach(n=>rewriteTree(n));}else if(m.type==='attributes'&&m.target){rewriteEl(m.target);}}});
    mo.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src','href','srcset','action','poster'],attributeOldValue:true});
    function patchLocationHref(){const d=Object.getOwnPropertyDescriptor(Location.prototype,'href');if(!d||!d.set)return;Object.defineProperty(Location.prototype,'href',{configurable:d.configurable,enumerable:d.enumerable,get:function(){return d.get.call(this);},set:function(v){try{if(v)v=toProxy(v);}catch{}return d.set.call(this,v);}});}patchLocationHref();
    ['pathname','search','hash'].forEach(prop=>{const d=Object.getOwnPropertyDescriptor(Location.prototype,prop);if(!d||!d.set)return;Object.defineProperty(Location.prototype,prop,{configurable:d.configurable,enumerable:d.enumerable,get:function(){return d.get.call(this);},set:function(v){try{const u=new URL(location.href);u[prop]=v;location.assign(toProxy(u.toString()));return;}catch{}return d.set.call(this,v);}});});
    const _open=window.open;window.open=function(u,n,s){try{if(u)u=toProxy(u);}catch{}return _open.call(this,u,n,s);};
    const _push=history.pushState.bind(history);history.pushState=function(s,t,u){if(u!=null){const nu=toProxy(u);if(nu&&nu!==location.href){if(window.top!==window){try{parent.postMessage({__ns_proxy_nav__:nu},'*');}catch{}}else{return _push(s,t,nu);}return;}return _push(s,t,u);}return _push(s,t,u);};
    const _replace=history.replaceState.bind(history);history.replaceState=function(s,t,u){if(u!=null){const nu=toProxy(u);if(nu&&nu!==location.href){if(window.top!==window){try{parent.postMessage({__ns_proxy_nav__:nu},'*');}catch{}}else{return _replace(s,t,nu);}return;}return _replace(s,t,u);}return _replace(s,t,u);};
    const _assign=location.assign.bind(location);location.assign=function(u){const nu=toProxy(u);if(nu&&nu!==location.href){if(window.top!==window){try{parent.postMessage({__ns_proxy_nav__:nu},'*');}catch{}}else{return _assign(nu);}return;}return _assign(u);};
    const _replaceLoc=location.replace.bind(location);location.replace=function(u){const nu=toProxy(u);if(nu&&nu!==location.href){if(window.top!==window){try{parent.postMessage({__ns_proxy_nav__:nu},'*');}catch{}}else{return _replaceLoc(nu);}return;}return _replaceLoc(u);};
  })();`;
  /* eslint-enable no-useless-escape */

  if ($('head').length === 0) $('html').prepend('<head></head>');
  if (!$('#ns-proxy-runtime').length) {
    $('head').prepend(`<script id="ns-proxy-runtime">${scriptContent}</script>`);
  }

  return $.html({ decodeEntities: false });
}

export const config = { api: { bodyParser: false, externalResolver: true } };

