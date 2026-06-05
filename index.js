'use strict';
const http = require('node:http');
const { WebClient } = require('@slack/web-api');

const token = process.env.SLACK_BOT_TOKEN;
const web = new WebClient(token);

const GITHUB_USER = 'GitHubユーザー名';
const REPO_NAME = 'リポジトリ名';
const IMAGE_URL = `https://raw.githubusercontent.com/${GITHUB_USER}/${REPO_NAME}/main/binturong.png`;

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

              const finalMessage = `${replyText}\n${IMAGE_URL}`;

              await web.chat.postMessage({
                channel: data.event.channel,
                text: finalMessage
              });
            }
          } catch (e) {
            console.error('JSON Parse Error', e);
          }
        });
    } else {
      res.write('OK');
      res.end();
    }
  })
  .on('error', e => {
    console.error('Server Error', e);
  });

// サーバーを起動するポートを設定
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.info(`Server is running on port ${port}`);
});
