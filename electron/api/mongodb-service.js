// electron/api/mongodb-service.js
const { MongoClient } = require('mongodb');

class MongoDBService {
  constructor(uri) {
    this.uri = uri;
    this.client = null;
    this.db = null;
  }

  async connect() {
    if (!this.client) {
      this.client = new MongoClient(this.uri);
      await this.client.connect();
      this.db = this.client.db();
    }
    return this.db;
  }

  async getArchitectures() {
    const db = await this.connect();
    return await db.collection('architectures').find({}).toArray();
  }

  async createArchitecture(name) {
    const db = await this.connect();
    const newArchitecture = {
      name,
      components: [],
      connections: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('architectures').insertOne(newArchitecture);
    return {
      _id: result.insertedId,
      ...newArchitecture
    };
  }

  // Add other methods as needed
}

module.exports = MongoDBService;