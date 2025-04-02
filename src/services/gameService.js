const db = require('../utils/db');
const gameLogic = require('../utils/gameLogic');

const handleMessage = (ws, roomId, message) => {
    const room = db.getRoomById(roomId);
    if (!room) {
        ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
        return;
    }

    try {
        switch (message.type) {
            case 'join':
                gameLogic.joinRoom(room, message.playerId, message.username);
                break;
            case 'leave':
                gameLogic.leaveRoom(room, message.playerId);
                break;
            case 'action':
                gameLogic.handleAction(room, message.playerId, message.action, message.amount);
                break;
            default:
                ws.send(JSON.stringify({ type: 'error', message: 'Invalid message type' }));
        }

        const gameState = gameLogic.getGameState(room);
        broadcastGameState(roomId, gameState);
    } catch (error) {
        ws.send(JSON.stringify({ type: 'error', message: error.message }));
    }
};

const handleDisconnect = (ws, roomId) => {
    const room = db.getRoomById(roomId);
    if (!room) return;

    const playerId = ws.playerId;
    gameLogic.leaveRoom(room, playerId);

    const gameState = gameLogic.getGameState(room);
    broadcastGameState(roomId, gameState);
};

const broadcastGameState = (roomId, gameState) => {
    const clients = db.getClientsByRoomId(roomId);
    clients.forEach(client => {
        client.send(JSON.stringify({ type: 'game_state', state: gameState }));
    });
};

module.exports = {
    handleMessage,
    handleDisconnect,
};