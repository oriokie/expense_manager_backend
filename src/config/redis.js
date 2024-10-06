const redis = require('redis');

class RedisClient {
  /**
   * Constructor for initializing the RedisClient
   */
  constructor() {
    this.client = redis.createClient();
    this.isConnected = false;

    this.client.on('connect', () => {
      this.isConnected = true;
      console.log('Redis client connected');
    });

    this.client.on('error', (error) => {
      this.isConnected = false;
      console.error(`Redis client error: ${error}`);
    });

    // Explicitly connect the Redis client
    (async () => {
      try {
        await this.client.connect();
      } catch (error) {
        console.error('Failed to connect Redis client:', error);
      }
    })();
  }

  /**
   * Checks if the client is connected to the server
   * @returns {boolean} True if connected, false otherwise
   */
  isAlive() {
    return this.isConnected;
  }

  /**
   * Gets the value of a key from the Redis server
   * @param {string} key The key
   * @returns {Promise<string>} The value of the key
   */
  async get(key) {
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error('Error getting key from Redis:', error);
    }
  }

  /**
   * Sets a key-value pair in the Redis server
   * @param {string} key The key
   * @param {string} value The value
   * @param {number} duration The expiration time for the key in seconds
   * @returns {Promise<void>}
   */
  async set(key, value, duration) {
    try {
      await this.client.set(key, value, { EX: duration });
    } catch (error) {
      console.error('Error setting key in Redis:', error);
    }
  }

  /**
   * Deletes a key from the Redis server
   * @param {string} key The key
   * @returns {Promise<void>}
   */
  async del(key) {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Error deleting key from Redis:', error);
    }
  }
}

const redisClient = new RedisClient();

module.exports = redisClient;
