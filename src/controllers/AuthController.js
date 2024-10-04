/**
 * Authenticator module - For authenticating users
 */
const dbClient = require('../config/db');
const redisClient = require('../config/redis');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

/**
 * Class representing an authentication controller
 */
class AuthController {
  /**
   * Registers a new user
   * @param {Object} req The request object
   * @param {Object} res The response object
   */
  async register(req, res) {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing Password' });
    }

    const existingUser = await dbClient.getDB().collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    const user = {
      userId,
      email,
      password: hashedPassword,
    };

    await dbClient.getDB().collection('users').insertOne(user);

    return res.status(201).json({ userId, email });
  }
}

module.exports = AuthController;
