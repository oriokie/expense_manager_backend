/**
 * MongoDB connection
 * Module that establishes connection to MongoDB
 */
const { MongoClient } = require('mongodb');

/** DBClient Class for MongoDB */
class DBClient {
  /**
   * Constructor for DBClient
   * uses env variables or defaults to localhost
   */
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '27017';
    const database = process.env.DB_DATABASE || 'expenses';
    const uri = `mongodb://${host}:${port}/${database}`;
    this.client = null;
    this.db = null;
  }

  /**
   * Connect to MongoDB using the provided URI
   * @returns {Promise<MongoClient>}
   * @throws {Error} if connection fails
   */
  async connect() {
    try {
      // initialize connection
      this.client = new MongoClient(this.uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      await this.client.connect();
      console.log('Connected to MongoDB');
      this.db = this.client.db('expenses');
    } catch (err) {
      console.error(`Error connecting to MongoDB: ${err.message}`);
      throw err;
    }
  }

  /**
   * Close the MongoDB connection
   * @returns {Promise<void>}
   */
  async close() {
    await this.client.close();
    console.log('Closed MongoDB connection');
    this.client = null;
    this.db = null;
  }

  /**
   * Checks if the client is connected to MongoDB
   * @returns {boolean}
   */
  isConnected() {
    return this.client !== null && this.client.isConnected();
  }

  /**
   * Gets the database instance.
   * @returns {Db}
   */
  getDB() {
    return this.db;
  }
}

// create a new instance of the DBClient
const dbClient = new DBClient();

module.exports = dbClient;
