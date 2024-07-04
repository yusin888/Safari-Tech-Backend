const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let db;

async function connectToDatabase() {
    try {
        await client.connect();
        db = client.db('SafariTech');
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

function getDb() {
    if (!db) {
        throw new Error('Database not connected. Call connectToDatabase first.');
    }
    return db;
}

module.exports = {
    connectToDatabase,
    getDb
};
