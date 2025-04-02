const express = require('express');
const bodyParser = require('body-parser');
const expressWs = require('express-ws');
const cors = require('cors'); // Импортируем пакет cors
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const gameRoutes = require('./routes/gameRoutes');

const app = express();
expressWs(app); // Инициализация express-ws

// Используем cors middleware
app.use(cors());

app.use(bodyParser.json());

app.use(authRoutes);
app.use(roomRoutes);
app.use(gameRoutes); // Подключение маршрутов WebSocket

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
