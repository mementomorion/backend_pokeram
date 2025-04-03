const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'texas_holdem',
    password: 'pass',
    port: 5432,
});

const query = (text, params) => pool.query(text, params);

const getUserByUsername = async (username) => {
    const res = await query('SELECT * FROM users WHERE username = $1', [username]);
    return res.rows[0];
};

const getUserById = async (id) => {
    const res = await query('SELECT * FROM users WHERE id = $1', [id]);
    return res.rows[0];
};

const saveUser = async (user) => {
    const res = await query(
        'INSERT INTO users (id, username, balance) VALUES ($1, $2, $3) RETURNING *',
        [user.id, user.username, user.balance]
    );
    return res.rows[0];
};

const getRooms = async () => {
    const res = await query('SELECT * FROM rooms');
    return res.rows;
};

const getRoomById = async (id) => {
    const res = await query('SELECT * FROM rooms WHERE id = $1', [id]);
    return res.rows[0];
};

const saveRoom = async (room) => {
    const res = await query(
        'INSERT INTO rooms (id, name, player_count, max_players, small_blind, big_blind, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [room.id, room.name, room.playerCount, room.maxPlayers, room.smallBlind, room.bigBlind, room.status]
    );
    return res.rows[0];
};

// Object to store clients by roomId
const clients = new Map();

const addClientToRoom = (roomId, client) => {
    if (!clients.has(roomId)) {
        clients.set(roomId, []);
    }
    clients.get(roomId).push(client);
};

const removeClientFromRoom = (roomId, client) => {
    if (clients.has(roomId)) {
        const roomClients = clients.get(roomId).filter(c => c !== client);
        clients.set(roomId, roomClients);
    }
};

const getClientsByRoomId = (roomId) => clients.get(roomId) || [];

module.exports = {
    query,
    getUserByUsername,
    getUserById,
    saveUser,
    getRooms,
    getRoomById,
    saveRoom,
    addClientToRoom,
    removeClientFromRoom,
    getClientsByRoomId,
};