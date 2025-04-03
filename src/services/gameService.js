const db = require('../utils/db');
const gameLogic = require('../utils/gameLogic');

const handleMessage = async (ws, roomId, message) => {
    const room = await db.getRoomById(roomId);
    if (!room) {
        ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
        return;
    }

    try {
        switch (message.type) {
            case 'join':
                if (!message.playerId || !message.username) {
                    throw new Error('Player ID and username are required');
                }
                gameLogic.joinRoom(room, message.playerId, message.username);
                ws.playerId = message.playerId;
                ws.send(JSON.stringify({ type: 'join_success' }));
                break;
            case 'leave':
                if (!message.playerId) {
                    throw new Error('Player ID is required');
                }
                gameLogic.leaveRoom(room, message.playerId);
                break;
            case 'action':
                if (!message.playerId || !message.action) {
                    throw new Error('Player ID and action are required');
                }
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

const handleDisconnect = async (ws, roomId) => {
    const room = await db.getRoomById(roomId);
    if (!room) return;

    const playerId = ws.playerId;
    if (!playerId) return;

    gameLogic.leaveRoom(room, playerId);

    const gameState = gameLogic.getGameState(room);
    broadcastGameState(roomId, gameState);
};

const broadcastGameState = async (roomId, gameState) => {
    const clients = db.getClientsByRoomId(roomId);
    if (!clients) {
        console.error(`No clients found for room ${roomId}`);
        return;
    }
    clients.forEach(client => {
        client.send(JSON.stringify({ type: 'game_state', state: gameState }));
    });
};

module.exports = {
    handleMessage,
    handleDisconnect,
};