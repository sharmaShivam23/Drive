const mongoose = require('mongoose')
require('dotenv').config()

const database = () => {
    const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    };

    mongoose.connect(process.env.URL, options)
    .then(() => {
       console.log("Successfully connected with database");
    })
    .catch((err) => {
      console.error("Database connection error:", err.message);
      process.exit(1);
    });

    // Handle connection events
    mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
    });
}

module.exports = database