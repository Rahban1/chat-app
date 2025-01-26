"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 8080 });
let allSockets = [];
wss.on("connection", (socket) => {
    console.log("user is connected");
    socket.on("message", (message) => {
        var _a;
        // user is not sending "hi there" now, now he will send full objects of which message is a part
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.type === 'join') {
            allSockets.push({
                socket,
                room: parsedMessage.payload.roomId
            });
        }
        if (parsedMessage.type === 'chat') {
            let currentUserRoom = (_a = allSockets.find(x => x.socket == socket)) === null || _a === void 0 ? void 0 : _a.room;
            // Send the complete message object instead of just the message text
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
