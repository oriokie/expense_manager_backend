const basicAuth = require('basic-auth');
const dbClient = require('../config/db');
const redisClient = require('../config/redis');
const AuthController = require('../controllers/AuthController');

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
    // Extract the email and password from the Authorization header
    const credentials = basicAuth(req);

    if (!credentials) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get the email and password
    const { name: email, pass: password } = credentials;

    // Hash the password
    const hashedPassword = await AuthController.hashPassword(password);

    // initialize db client
    const usersCollection = await dbClient.getUsersCollection();
    const user = await usersCollection.findOne({ email, password: hashedPassword });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
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
    // get the tome from the Authorization header
    const token = req.header('x-token');

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
    const user = await usersCollection.findOne({ _id: ObjectId(userId) });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = user;

    // Continue to the next middleware
    next();
  }
}

module.exports = AuthMiddleware;
