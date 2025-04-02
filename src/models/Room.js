const { v4: uuidv4 } = require('uuid');

class Room {
    constructor(name, maxPlayers, smallBlind, bigBlind) {
        this.id = uuidv4();
        this.name = name;
        this.playerCount = 0;
        this.maxPlayers = maxPlayers;
        this.smallBlind = smallBlind;
        this.bigBlind = bigBlind;
        this.status = 'waiting';
        this.phase = 'waiting';
        this.players = [];
        this.communityCards = [];
        this.pot = 0;
        this.currentBet = 0;
        this.dealerIndex = -1;
        this.smallBlindIndex = -1;
        this.bigBlindIndex = -1;
        this.currentPlayerIndex = -1;
        this.timeLeft = 0;
        this.deck = [];
    }
}

module.exports = Room;