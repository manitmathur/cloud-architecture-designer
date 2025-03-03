const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('CRITICAL: MONGODB_URI is not defined');
  throw new Error('Please define the MONGODB_URI environment variable in .env.local');
}

async function connectToDatabase() {
  try {
    console.log('Attempting to connect to MongoDB...');
    
    // Sanitize URI for logging (hide password)
    const sanitizedUri = uri.replace(/\/\/.*:(.*)@/, '//****:****@');
    console.log(`Connecting to: ${sanitizedUri}`);

    const client = new MongoClient(uri, {
      // Add these options for better connection handling
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });

    // Attempt connection
    await client.connect();
    
    console.log('MongoDB connection successful');
    
    // Get the database name from the URI or use a default
    const dbName = new URL(uri).pathname.substring(1) || 'cloudarchitect';
    const db = client.db(dbName);
    
    return { client, db };
  } catch (error) {
    console.error('FATAL: MongoDB Connection Error', error);
    throw error;
  }
}

module.exports = { connectToDatabase };