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
   * return {Object} The response object
   */
  async register(req, res) {
    const { name, email, password } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'The Name Missing' });
    }
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing Password' });
    }

    // Use the usersCollection method to get the users collection
    const usersCollection = await dbClient.getUsersCollection();

    const existingUser = await usersCollection.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await AuthController.hashPassword(password);
    const userId = uuidv4();
    const user = {
      userId,
      name,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    await usersCollection.insertOne(user);

    return res.status(201).json({ userId, name, email, createdAt: user.createdAt });
  }

  /**
   * Logins in a user
   */
  static async login(req, res) {
    const token = crypto.randomBytes(16).toString('hex');
    await redisClient.set(`auth_${token}`, req.user._id.toString(), 86400);
    res.json({ token });
  }

  /**
   * Logs out a user
   */
  static async logout(req, res) {
    const token = req.headers.authorization.split(' ')[1];
    await redisClient.del(`auth_${token}`);
    res.status(204).json({ message: 'Logout successful' });
  }

  /**
   * hash password
   */
  static async hashPassword(password) {
    return bcrypt.hash(password, 10);
  }
}

module.exports = new AuthController();
