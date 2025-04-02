const { v4: uuidv4 } = require('uuid');
const db = require('./db');
const poker = require('poker-hand-evaluator');

const phases = ['waiting', 'preflop', 'flop', 'turn', 'river', 'showdown'];

const joinRoom = (room, playerId, username) => {
    if (room.playerCount >= room.maxPlayers) {
        throw new Error('Room is full');
    }

    const player = { id: playerId, username: username, chips: 1000, hand: [], isFolded: false, bet: 0 };
    room.players.push(player);
    room.playerCount += 1;

    if (room.playerCount >= 2 && room.status === 'waiting') {
        room.status = 'starting';
        startGame(room);
    }
};

const leaveRoom = (room, playerId) => {
    room.players = room.players.filter(player => player.id !== playerId);
    room.playerCount -= 1;

    if (room.playerCount < 2) {
        room.status = 'waiting';
        room.phase = 'waiting';
    }
};

const handleAction = (room, playerId, action, amount = 0) => {
    const player = room.players.find(player => player.id === playerId);
    if (!player) {
        throw new Error('Player not found');
    }

    switch (action) {
        case 'fold':
            player.isFolded = true;
            break;
        case 'check':
            // No additional logic needed for check
            break;
        case 'call':
            const callAmount = room.currentBet - player.bet;
            player.chips -= callAmount;
            player.bet += callAmount;
            room.pot += callAmount;
            break;
        case 'bet':
            if (amount <= 0) {
                throw new Error('Bet amount must be greater than zero');
            }
            player.chips -= amount;
            player.bet += amount;
            room.pot += amount;
            room.currentBet = player.bet;
            break;
        case 'raise':
            if (amount <= room.currentBet) {
                throw new Error('Raise amount must be greater than the current bet');
            }
            const raiseAmount = amount - player.bet;
            player.chips -= raiseAmount;
            player.bet += raiseAmount;
            room.pot += raiseAmount;
            room.currentBet = player.bet;
            break;
        default:
            throw new Error('Invalid action');
    }

    moveToNextPlayer(room);
};

const getGameState = (room) => {
    return {
        players: room.players.map(player => ({
            id: player.id,
            username: player.username,
            chips: player.chips,
            hand: player.hand,
            isFolded: player.isFolded,
            bet: player.bet
        })),
        communityCards: room.communityCards,
        pot: room.pot,
        currentPlayer: room.players[room.currentPlayerIndex].id,
        dealer: room.players[room.dealerIndex].id,
        smallBlind: room.players[room.smallBlindIndex].id,
        bigBlind: room.players[room.bigBlindIndex].id,
        phase: room.phase,
        currentBet: room.currentBet,
        timeLeft: room.timeLeft
    };
};

const startGame = (room) => {
    room.deck = createDeck();
    room.communityCards = [];
    room.pot = 0;
    room.currentBet = 0;

    room.dealerIndex = (room.dealerIndex + 1) % room.players.length;
    room.smallBlindIndex = (room.dealerIndex + 1) % room.players.length;
    room.bigBlindIndex = (room.dealerIndex + 2) % room.players.length;
    room.currentPlayerIndex = (room.dealerIndex + 3) % room.players.length;

    dealCards(room);

    room.phase = 'preflop';
    room.status = 'playing';
    room.timeLeft = 60;

    // Post blinds
    const smallBlind = room.smallBlind;
    const bigBlind = room.bigBlind;

    room.players[room.smallBlindIndex].chips -= smallBlind;
    room.players[room.smallBlindIndex].bet = smallBlind;
    room.pot += smallBlind;

    room.players[room.bigBlindIndex].chips -= bigBlind;
    room.players[room.bigBlindIndex].bet = bigBlind;
    room.pot += bigBlind;
    room.currentBet = bigBlind;

    moveToNextPlayer(room);
};

const createDeck = () => {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck = [];

    suits.forEach(suit => {
        values.forEach(value => {
            deck.push({ suit, value });
        });
    });

    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
};

const dealCards = (room) => {
    room.players.forEach(player => {
        player.hand = [room.deck.pop(), room.deck.pop()];
        player.isFolded = false;
        player.bet = 0;
    });
};

const moveToNextPlayer = (room) => {
    do {
        room.currentPlayerIndex = (room.currentPlayerIndex + 1) % room.players.length;
    } while (room.players[room.currentPlayerIndex].isFolded);

    if (isBettingRoundComplete(room)) {
        advanceGamePhase(room);
    }
};

const isBettingRoundComplete = (room) => {
    return room.players.every(player => 
        player.isFolded || player.bet === room.currentBet || player.chips === 0
    );
};

const advanceGamePhase = (room) => {
    switch (room.phase) {
        case 'preflop':
            room.phase = 'flop';
            room.communityCards.push(room.deck.pop(), room.deck.pop(), room.deck.pop());
            break;
        case 'flop':
            room.phase = 'turn';
            room.communityCards.push(room.deck.pop());
            break;
        case 'turn':
            room.phase = 'river';
            room.communityCards.push(room.deck.pop());
            break;
        case 'river':
            room.phase = 'showdown';
            determineWinner(room);
            break;
        default:
            throw new Error('Invalid game phase');
    }

    room.currentBet = 0;
    room.players.forEach(player => player.bet = 0);

    room.currentPlayerIndex = (room.dealerIndex + 1) % room.players.length;
    moveToNextPlayer(room);
};

const determineWinner = (room) => {
    const activePlayers = room.players.filter(player => !player.isFolded);
    const winner = activePlayers.reduce((bestPlayer, player) => {
        const playerHand = poker.evaluate([...player.hand, ...room.communityCards]);
        if (!bestPlayer || playerHand.value > bestPlayer.hand.value) {
            return { player, hand: playerHand };
        }
        return bestPlayer;
    }, null);

    winner.player.chips += room.pot;
    room.pot = 0;

    room.status = 'finished';
    room.phase = 'waiting';
};

module.exports = {
    phases,
    joinRoom,
    leaveRoom,
    handleAction,
    getGameState,
    startGame,
    createDeck,
    dealCards,
    moveToNextPlayer,
    isBettingRoundComplete,
    advanceGamePhase,
    determineWinner,
};