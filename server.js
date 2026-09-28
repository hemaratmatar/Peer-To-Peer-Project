try {
    process.loadEnvFile();
} catch (err) {
    console.error('.env file not found - copy .env.example to .env');
    process.exit(1);
}

const express = require('express');
const connectDB = require('./config/db');
const jwtSecret = require('./utils/jwtSecret');
const app = express();

try {
    jwtSecret();
} catch (err) {
    console.error(err.message);
    process.exit(1);
}

app.use(express.json());
app.get('/',(req,res)=> res.send('API Running'));


app.use('/api/user',require('./router/api/user'));
app.use('/api/auth',require('./router/api/auth'));
app.use('/api/know',require('./router/api/knowlege'));
app.use('/api/resever',require('./router/api/reserver'));
app.use('/api/sender',require('./router/api/sender'));

const PORT = process.env.PORT || 5001;

const start = async () => {
    try {
        await connectDB();
        app.listen(PORT, ()=> console.log(`server Started on port ${PORT}`));
    } catch {
        console.log('Retrying MongoDB connection in 5 seconds...');
        setTimeout(start, 5000);
    }
};

start();
