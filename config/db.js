const mongoose = require('mongoose');
const db = process.env.MONGODB_URI;

const connectDB = async ()=>{
    try{
        if (!db) throw new Error('MONGODB_URI is missing from .env');

        await mongoose.connect(db,{
            dbName: process.env.MONGODB_DB || 'knowlegegsb',
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify:false,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        });
        console.log("MongoDB Connected..");
    }catch(err){
        console.error(`MongoDB connection failed: ${err.message}`);
        throw err;
    }
};

module.exports = connectDB;
