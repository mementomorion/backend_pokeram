const roomService = require('../services/roomService');

const createRoom = async (req, res) => {
    const { name, maxPlayers, smallBlind, bigBlind } = req.body;
    try {
        const room = await roomService.createRoom(name, maxPlayers, smallBlind, bigBlind);
        res.status(201).json(room);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getRooms = async (req, res) => {
    const { playerId } = req.query; // Изменено на req.query
    try {
        const rooms = await roomService.getRooms(playerId);
        res.status(200).json(rooms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createRoom, getRooms };