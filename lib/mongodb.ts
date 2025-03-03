// lib/mongodb.ts

import { MongoClient } from 'mongodb';

// Global variable to maintain MongoDB connection across hot reloads
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {
  // Add these options for better connection handling
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 5000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

/**
 * Helper function to get the database connection
 * @returns A promise resolving to an object with client and db instances
 */
export async function connectToDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    const client = await clientPromise;
    const db = client.db();
    console.log('MongoDB connection successful');
    return { client, db };
  } catch (error) {
    console.error('FATAL: MongoDB Connection Error', error);
    throw error;
  }
}

// Export a module-scoped MongoClient promise for reuse
export default clientPromise;