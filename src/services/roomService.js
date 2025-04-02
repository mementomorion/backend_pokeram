const Room = require('../models/Room');
const db = require('../utils/db');

const createRoom = async (name, maxPlayers, smallBlind, bigBlind) => {
    const room = new Room(name, maxPlayers, smallBlind, bigBlind);
    await db.saveRoom(room);
    return room;
};

const getRooms = async (playerId) => {
    const user = await db.getUserById(playerId);
    if (!user) {
        throw new Error('User not found');
    }
    return await db.getRooms();
};

module.exports = { createRoom, getRooms };