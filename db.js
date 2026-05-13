const { MongoClient } = require('mongodb');
require('dotenv').config();

// Fallback URI for Jenkins / Windows DNS issues
const fallbackUri =
    "mongodb://Shanmuk:%40Pandu2006@ac-c0lijgx-shard-00-00.movdrxf.mongodb.net:27017,ac-c0lijgx-shard-00-01.movdrxf.mongodb.net:27017,ac-c0lijgx-shard-00-02.movdrxf.mongodb.net:27017/?ssl=true&replicaSet=atlas-c84kpj-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster-1";

// Use Atlas URI from .env if available
const uri = process.env.MONGO_ATLAS_URI && process.env.MONGO_ATLAS_URI.includes('%40') ? process.env.MONGO_ATLAS_URI : fallbackUri;

// Mongo client options
const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
});

let AgriDB = null;

async function connectDB() {
    try {
        // Prevent reconnecting if already connected
        if (AgriDB) {
            return AgriDB;
        }

        await client.connect();

        AgriDB = client.db("AgriDB");

        await AgriDB.command({ ping: 1 });

        console.log("Connected successfully to MongoDB");

        return AgriDB;

    } catch (error) {

        console.error("Could not connect to MongoDB:", error.message);
        throw error;
    }
}

module.exports = { connectDB, client };