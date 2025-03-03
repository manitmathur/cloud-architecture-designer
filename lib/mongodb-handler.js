// lib/mongodb-handler.js
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is not defined');
  throw new Error('Please define the MONGODB_URI environment variable');
}

async function connectToDatabase() {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('URI:', uri.replace(/\/\/.*:(.*)@/, '//****:****@')); // Safely log URI

    const client = new MongoClient(uri);
    await client.connect();
    
    console.log('MongoDB connection successful');
    const db = client.db(); // If no database name specified, it uses the default database
    
    return { client, db };
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    throw error;
  }
}

module.exports = { connectToDatabase };