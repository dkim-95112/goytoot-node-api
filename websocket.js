const WebSocket = require('ws');
const Toot = require('./models/toots');

class WebSocketServer {
    nConnections = [];

    constructor(httpServer) {
        this.httpServer = httpServer;
        this.wss = new WebSocket.Server({
            server: this.httpServer,
        })
        this.wss.on('connection', (ws) => {
            this.nConnections.push(ws);
            console.log('websocket connecting: %o', this.nConnections.length);
            // connection is up, let's add a simple simple event
            ws.on('message', (message) => {
                //log the received message and send it back to the client
                console.log('received: %s', message);
                ws.send(JSON.stringify({
                    message: `Hello, you sent -> ${message}`
                }));
            });
            ws.on('close', () => {
                console.log('websocket closing: ', this.nConnections.length)
                this.nConnections = this.nConnections.filter(
                    ws => ws !== ws
                )
            })
            Toot.watch().on(
                'change',
                change => {
                    console.log(change)
                    ws.send(JSON.stringify(change));
                }
            );
            // send immediatly a feedback to the incoming connection
            ws.send(JSON.stringify({
                message: 'Hi there, I am a WebSocket server'
            }));
        });
    }
}

module.exports = WebSocketServer;
