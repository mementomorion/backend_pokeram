const express = require('express');
const { handleGameConnection } = require('../controllers/gameController');
const router = express.Router();

module.exports = (app) => {
    // Убедитесь, что express-ws инициализировано до использования app.ws
    app.ws('/game/:roomId', handleGameConnection);
    return router;
};