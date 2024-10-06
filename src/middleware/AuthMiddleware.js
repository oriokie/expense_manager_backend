const basicAuth = require('basic-auth');
const dbClient = require('../config/db');
const redisClient = require('../config/redis');
const AuthController = require('../controllers/AuthController.js');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');

/**
 * Middleware to authenticate a user
 */
class AuthMiddleware {
  /**
   * Middleware to authenticate a user
   * - Extracts email and password from the Authorization header
   * - Hashes the passwoed and compares it with the stored password
   * - If the password is correct, attaches the user object to the request object
   * - If the password is incorrect, the user is not authenticated
   */
  static async authenticateUser(req, res, next) {
    // Get the credentials from the request body
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({ error: 'Missing email or password' });
    }

    // initialize db client
    const usersCollection = await dbClient.getUsersCollection();
    const user = await usersCollection.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ error: 'Unauthorized: Password is incorrect' });
    }

    req.user = user;

    // Continue to the next middleware
    next();
  }

  /**
   * Method to check if the user auth token is valid
   * - Extracts the token from the Authorization header
   * - Checks if the token is valid from the Redis Db
   * - If the token is valid, attaches the user object to the request object
   * - If the token is invalid, the user is not authenticated
   */
  static async authenticateToken(req, res, next) {
    // Get the token from the Authorization header
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // check if the token is valid
    const userId = await redisClient.get(`auth_${token}`);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // get the user from the database
    const usersCollection = await dbClient.getUsersCollection();
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = user;

    console.log(user);

    // Continue to the next middleware
    next();
  }
}

module.exports = AuthMiddleware;
