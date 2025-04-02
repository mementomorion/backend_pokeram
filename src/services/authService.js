const User = require('../models/User');
const db = require('../utils/db');

const login = async (username) => {
    let user = await db.getUserByUsername(username);
    if (!user) {
        user = new User(username);
        await db.saveUser(user);
    }
    return user;
};

module.exports = { login };