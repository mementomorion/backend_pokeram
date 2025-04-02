const express = require('express');
const { handleGameConnection } = require('../controllers/gameController');
const router = express.Router();

module.exports = (app) => {
    app.ws('/game/:roomId', handleGameConnection);
    return router;
};