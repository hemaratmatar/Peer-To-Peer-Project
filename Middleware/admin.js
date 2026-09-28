const User = require('../model/User');

module.exports = async function(req, res, next) {
    try {
        const user = await User.findById(req.user.id).select('-password');

        if (!user || user.role !== 'admin') {
            return res.status(403).json({ msg: 'Admin access required' });
        }

        req.authUser = user;
        next();
    } catch (err) {
        res.status(500).send('Server Error');
    }
};
