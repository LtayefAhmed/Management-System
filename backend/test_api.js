const http = require('http');

const hosts = ['localhost', '127.0.0.1', '::1'];

function tryHost(host) {
  return new Promise((resolve) => {
    const opts = { host, port: 3000, path: '/api/articles/chercher', timeout: 3000 };
    const req = http.get(opts, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => resolve({ host, status: res.statusCode, body }));
    });
    req.on('error', (e) => resolve({ host, error: e.message }));
    req.on('timeout', () => { req.abort(); resolve({ host, error: 'timeout' }); });
  });
}

(async () => {
  for (const h of hosts) {
    const r = await tryHost(h);
    console.log('try', h, r);
  }
})();