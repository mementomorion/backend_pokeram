const express = require('express');
const { getRooms, createRoom } = require('../controllers/roomController');
const router = express.Router();

router.get('/rooms', getRooms);
router.post('/rooms', createRoom);

module.exports = router;