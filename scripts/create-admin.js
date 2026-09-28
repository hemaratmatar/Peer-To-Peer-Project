// Usage: npm run create-admin -- <username> "<full name>" <uid> [password]
// Creates the first admin account. A secure password is generated when none is given.
process.loadEnvFile();

const bcrypt = require('bcryptjs');
const { randomBytes } = require('crypto');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../model/User');

const [username, name, uid, givenPassword] = process.argv.slice(2);

const run = async () => {
    if (!username || !name || !uid) {
        console.error('Usage: npm run create-admin -- <username> "<full name>" <uid> [password]');
        process.exitCode = 1;
        return;
    }
    if (givenPassword && givenPassword.length < 6) {
        console.error('Password must contain at least 6 characters');
        process.exitCode = 1;
        return;
    }

    await connectDB();
    try {
        if (await User.findOne({ username })) {
            console.error(`User "${username}" already exists`);
            process.exitCode = 1;
            return;
        }
        const password = givenPassword || `${randomBytes(12).toString('base64url')}Aa1!`;
        await new User({
            name,
            username,
            uid,
            role: 'admin',
            password: await bcrypt.hash(password, await bcrypt.genSalt(10))
        }).save();
        console.log(`Admin "${username}" created.`);
        if (!givenPassword) console.log(`Generated password (shown once): ${password}`);
    } finally {
        await mongoose.disconnect();
    }
};

run().catch(err => {
    console.error(err.message);
    process.exitCode = 1;
});
