const redis = require('redis');
const { promisify } = require('util');

/**
 * RedisClient Class
 * Provides asynchronous methods (get, set, del)
 * Also checks if the client is connected to the server
 */
class RedisClient {
  /**
   * Constructor for initializing the RedisClient
   * Also sets up promisified methods
   */
  constructor() {
    this.client = redis.createClient();
    this.isConnected = true;
    this.client.on('error', (error) => {
      this.isConnected = false;
      console.error(`Redis client error: ${error}`);
    });

    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
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
    return await this.getAsync(key);
  }
  /**
   * Sets a key-value pair in the Redis server
   * @param {string} key The key
   * @param {string} value The value
   * @param {number} duration The expiration time for the key in seconds
   * @returns {Promise<void>}
   */
  async set(key, value, duration) {
    await this.setAsync(key, value, 'EX', duration);
  }

  /**
   * Deletes a key from the Redis server
   * @param {string} key The key
   * @returns {Promise<void>}
   */
  async del(key) {
    await this.delAsync(key);
  }
}

const redisClient = new RedisClient();

export default redisClient;
