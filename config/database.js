const mongoose = require('mongoose')
require('dotenv').config()

const database = () => {
    const options = {
        maxPoolSize: 60, //maximum number of connections your app can have open to the MongoDB server at one time.
        serverSelectionTimeoutMS: 5000,//Sets how long (in milliseconds) the MongoDB client should wait when trying to connect to a server before throwing an error
        socketTimeoutMS: 45000,//This sets how long the socket connection between your app and MongoDB can remain open without activity before timing out.
        ssl: true,
    };

    mongoose.connect(process.env.URL , options)
    .then(() => {
       console.log("Successfully connected with database");
    })
    .catch((err) => {
      console.error("Database connection error:", err.message);
      process.exit(1);
    });

    mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
    });

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