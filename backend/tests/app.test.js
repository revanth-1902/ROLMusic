const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../src/app');

function startServer() {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      resolve(server);
    });
  });
}

test('GET /health returns ok', async () => {
  const server = await startServer();
  const { port } = server.address();

  const response = await new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${port}/health`, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    }).on('error', reject);
  });

  assert.equal(response.statusCode, 200);
  assert.match(response.body, /"status":"ok"/);
  server.close();
});
