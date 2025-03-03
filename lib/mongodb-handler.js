// lib/mongodb-handler.js
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'your-mongodb-atlas-connection-string';

async function connectToDatabase() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  return { client, db };
}

module.exports = { connectToDatabase };