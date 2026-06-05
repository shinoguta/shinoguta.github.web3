'use strict';
const http = require('node:http');

const server = http
  .createServer((req, res) => {
    const now = new Date();
    console.info(`[${now}] Requested by ${req.socket.remoteAddress}`);

    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8'
    });

    switch (req.method) {
      case 'GET':
        res.write(`GET ${req.url}\n`);
        break;
      case 'POST':
        res.write(`POST ${req.url}\n`);
        let rawData = '';
        req
          .on('data', chunk => {
            rawData += chunk;
          })
          .on('end', () => {
            console.info(`[${now}] Data posted: ${rawData}`);
          });
        break;
      default:
        break;
    }
    res.end();
  })
  .on('error', e => {
    console.error(`[${new Date()}] Server Error`, e);
  })
  .on('clientError', (e, socket) => {
    console.error(`[${new Date()}] Client Error`, e);
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
  });

const port = 8000;
server.listen(port, () => {
  console.log(`Listening on ${port}`);
});
