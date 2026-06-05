'use strict';
const http = require('node:http');
const { WebClient } = require('@slack/web-api');

const token = process.env.SLACK_BOT_TOKEN;
const web = new WebClient(token);

const server = http
  .createServer((req, res) => {
    const now = new Date();
    console.info(`[${now}] Requested by ${req.socket.remoteAddress}`);

    if (req.method === 'POST') {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('OK');

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
    } else {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('OK');
    }
  })
  .on('error', e => {
    console.error('Server Error', e);
  });

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.info(`Server is running on port ${port}`);
});
