const WebSocket = require('ws');

class WebSocketService {
  constructor(httpServer) {
    this.httpServer = httpServer;
    this.wss = new WebSocket.Server({
      server: this.httpServer,
    })
    this.wss.on('connection', (ws) => {
      console.log('websocket connecting # %o', this.wss.clients.size);
      ws.on('message', (message) => {
        console.log('received: %s', message);
        ws.send(JSON.stringify({
          message: `Hello, you sent -> ${message}`
        }));
      });
      ws.on('close', () => {
        console.log('websocket closing # ', this.wss.clients.length)
      })
      // send immediatly a feedback to the incoming connection
      ws.send(JSON.stringify({
        message: 'Hi there, I am a WebSocket server'
      }));
    });
  }
}

module.exports = WebSocketService;
