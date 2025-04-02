const { v4: uuidv4 } = require('uuid');

class User {
    constructor(username, balance = 10000) {
        this.id = uuidv4();
        this.username = username;
        this.balance = balance;
    }
}

module.exports = User;