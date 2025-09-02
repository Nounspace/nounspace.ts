import fetch from 'node-fetch';

export default async function handler(req, res) {
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
      redirect: 'follow'
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
    res.setHeader('Content-Security-Policy', "frame-ancestors 'self' *");

    if (response.body) {
      response.body.pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch the requested site' });
  }
}
