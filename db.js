const mongoose = require('mongoose');
require('dotenv').config()

//Define the MongoDB connection URL
const mongoURL = process.env.DB_URL_LOCAL;
// To connect to mongo atlas free cloud database server
// const mongoURL = process.env.DB_URL;

//Setup mongoDB connection
mongoose.connect(mongoURL,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 60000, // Increase the timeout to 60 seconds
})

//Get the default connection
//MOngoose maintains a default connection object "db" representing the MongoDB connection
const db = mongoose.connection;

//Define the event listners for database connections

db.on('connected',()=>{
    console.log("Connected to MongoDB Server");
})

db.on('error',(err)=>{
    console.log("MongoDB connection error: " + err);
})

db.on('disconnected',()=>{
    console.log("Disconnected to MongoDB Server");
})

//Export the database connection
module.exports = db;