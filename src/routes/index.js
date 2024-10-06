/**
 * Routes
 */
const express = require('express');

// Import the controllers
const AuthController = require('../controllers/AuthController');
const AuthMiddleware = require('../middleware/AuthMiddleware');
const CategoryController = require('../controllers/CategoryController');

// Create the router
const router = express.Router();

// Handle the request using router
router.post('/register', AuthController.register);
router.post('/login', AuthMiddleware.authenticateUser, AuthController.login);
router.post('/logout', AuthMiddleware.authenticateToken, AuthController.logout);
router.post(
  '/categories/seed',
  AuthMiddleware.authenticateToken,
  CategoryController.seedCategories
);
router.get('/categories', AuthMiddleware.authenticateToken, CategoryController.getCategories);
router.post('/categories', AuthMiddleware.authenticateToken, CategoryController.addCategory);
router.delete(
  '/categories/:id',
  AuthMiddleware.authenticateToken,
  CategoryController.removeCategory
);
router.put('/categories/:id', AuthMiddleware.authenticateToken, CategoryController.updateCategory);

module.exports = router;
