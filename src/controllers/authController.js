const authService = require('../services/authService');

const login = async (req, res) => {
    const { username } = req.body;
    try {
        const user = await authService.login(username);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { login };