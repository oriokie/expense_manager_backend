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
   * @return {Object} The response object
   */
  static async register(req, res) {
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

    const token = crypto.randomBytes(16).toString('hex');
    await redisClient.set(`auth_${token}`, user._id.toString(), 86400);

    return res.status(201).json({ userId, name, email, createdAt: user.createdAt, token });
  }

  /**
   * Logs in a user
   * @param {Object} req The request object
   * @param {Object} res The response object
   * @return {Object} The response object
   */
  static async login(req, res) {
    const token = crypto.randomBytes(16).toString('hex');
    await redisClient.set(`auth_${token}`, req.user._id.toString(), 86400);
    res.json({ token });
  }

  /**
   * Logs out a user
   * @param {Object} req The request object
   * @param {Object} res The response object
   * @return {Object} The response object
   */
  static async logout(req, res) {
    const token = req.headers.authorization.split(' ')[1];
    await redisClient.del(`auth_${token}`);
    res.status(200).json({ message: 'Logout successful' });
  }

  /**
   * Hash password
   * @param {string} password The password to hash
   * @return {string} The hashed password
   */
  static async hashPassword(password) {
    return bcrypt.hash(password, 10);
  }

  /**
   * Retrieves all users
   */
  static async getUsers(req, res) {
    try {
      const usersCollection = await dbClient.getUsersCollection();
      const users = await usersCollection.find().toArray();

      //remove password from response
      users.forEach((user) => {
        delete user.password;
      });

      return res.status(200).json({ users });
    } catch (error) {
      console.error('Error getting users:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = AuthController;
