import { WebSocketServer, WebSocket } from "ws";
import http from 'http';

const server = http.createServer();
const wss = new WebSocketServer({ server });

const PORT = 8080;

interface User {
    socket: WebSocket;
    room: string;
}

let allSockets: User[] = [];

wss.on("connection", (socket) => {
    console.log("user is connected");

    socket.on("message", (message) => {
        const parsedMessage = JSON.parse(message as unknown as string);
        if (parsedMessage.type === 'join') {
            allSockets.push({
                socket,
                room: parsedMessage.payload.roomId
            });
        }
        if (parsedMessage.type === 'chat') {
            let currentUserRoom = allSockets.find(x => x.socket == socket)?.room;
            
            const messageToSend = JSON.stringify({
                type: 'chat',
                payload: {
                    message: parsedMessage.payload.message,
                    sender: parsedMessage.payload.sender,
                    roomId: currentUserRoom
                }
            });
            
            allSockets
                .filter((s) => s.room === currentUserRoom)
                .forEach(s => s.socket.send(messageToSend));
        }
    });

    socket.on("close", () => {
        allSockets = allSockets.filter(x => x.socket !== socket);
    });
});

server.listen(PORT, () => {
    console.log(`WebSocket server is running on port ${PORT}`);
});

// Handle CORS preflight requests
server.on('upgrade', (request, socket, head) => {
    const origin = request.headers.origin;
    if (!origin) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});