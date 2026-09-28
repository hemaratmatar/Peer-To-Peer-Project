const jwt = require('jsonwebtoken');
const User = require('../model/User');
const jwtSecret = require('../utils/jwtSecret');

module.exports = async function(req, res, next) {
    //Get token from header
    const token = req.header('x-auth-token');
    //check if not token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    //verify token
    let decoded;
    try {
        decoded = jwt.verify(token, jwtSecret());
    } catch (err) {
        return res.status(401).json({ msg: 'Token is not valid' });
    }

    //reject tokens of deleted accounts
    try {
        if (!decoded.user || !(await User.exists({ _id: decoded.user.id }))) {
            return res.status(401).json({ msg: 'Token is not valid' });
        }
    } catch (err) {
        return res.status(500).send('Server Error');
    }

    req.user = decoded.user;
    next();
};
