const gameService = require('../services/gameService');

const handleGameConnection = (ws, req) => {
    const { roomId } = req.params;

    ws.on('open', () => {
        console.log(`WebSocket connection established for room ${roomId}`);
    });

    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);
        gameService.handleMessage(ws, roomId, parsedMessage);
    });

    ws.on('close', (code, reason) => {
        console.log(`WebSocket connection closed for room ${roomId}: ${code} ${reason}`);
        gameService.handleDisconnect(ws, roomId);
    });

    ws.on('error', (error) => {
        console.error(`WebSocket error for room ${roomId}: ${error.message}`);
    });

    ws.send(JSON.stringify({ type: 'connected', message: 'Welcome to the game!' }));
};

module.exports = { handleGameConnection };