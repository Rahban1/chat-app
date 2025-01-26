import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port : 8080 });


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
