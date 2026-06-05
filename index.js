'use strict';
const http = require('node:http');
const { WebClient } = require('@slack/web-api');

const token = process.env.SLACK_BOT_TOKEN;
const web = new WebClient(token);

const server = http
  .createServer((req, res) => {
    const now = new Date();
    console.info(`[${now}] Requested by ${req.socket.remoteAddress}`);

    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8'
    });

    if (req.method === 'POST') {
      let rawData = '';
      req
        .on('data', chunk => {
          rawData += chunk;
        })
        .on('end', async () => {
          console.info(`[${now}] Data posted: ${rawData}`);
          
          try {
            const data = JSON.parse(rawData);

            if (data.type === 'url_verification') {
              res.write(data.challenge);
              res.end();
              return;
            }

            if (data.event && data.event.type === 'message' && !data.event.bot_id) {
              const userText = data.event.text || '';
              let replyText = '';

              if (userText.includes('おはよう') || userText.includes('こんにちは') || userText.includes('こんばんは')) {
                replyText = 'ニャー';
              } else if (userText.includes('ご飯')) {
                replyText = 'グルグル';
              } else if (userText.includes('おやすみ')) {
                replyText = 'シュー';
              } else {
                replyText = 'ウゥー！';
              }

              await web.chat.postMessage({
                channel: data.event.channel,
                text: replyText
              });
            }
          } catch (e) {
            console.error('JSON Parse Error', e);
          }
        });
    }

    res.write('OK');
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
