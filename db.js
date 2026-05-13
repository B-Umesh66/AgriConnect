const { MongoClient } = require('mongodb');
require('dotenv').config();

// Using standard MongoDB URI to bypass Windows DNS SRV lookup failures (EREFUSED)
const fallbackUri = "mongodb://Shanmuk:%40Pandu2006@ac-c0lijgx-shard-00-00.movdrxf.mongodb.net:27017,ac-c0lijgx-shard-00-01.movdrxf.mongodb.net:27017,ac-c0lijgx-shard-00-02.movdrxf.mongodb.net:27017/?ssl=true&replicaSet=atlas-c84kpj-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster-1";

const uri = process.env.MONGO_ATLAS_URI && process.env.MONGO_ATLAS_URI.includes('%40') ? process.env.MONGO_ATLAS_URI : fallbackUri;
const client = new MongoClient(uri);
let AgriDB;

async function connectDB() {
    
    try {
        await client.connect();
        AgriDB = client.db("AgriDB");
        await AgriDB.command({ping: 1}); 
        console.log("Connected successfully to MongoDB");
        return AgriDB;
    } catch (error) {                                                 
        console.error("Could not connect to MongoDB", error);
        process.exit(1); 
    }
}

module.exports = { connectDB, client };