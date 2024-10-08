/**
 * Routes
 */
const express = require('express');

// Import the controllers
const AuthController = require('../controllers/AuthController');
const AuthMiddleware = require('../middleware/AuthMiddleware');
const CategoryController = require('../controllers/CategoryController');
const ExpenseController = require('../controllers/ExpenseController');

// Create the router
const router = express.Router();

// Handle the request using router
router.post('/register', AuthController.register);
router.post('/login', AuthMiddleware.authenticateUser, AuthController.login);
router.post('/logout', AuthMiddleware.authenticateToken, AuthController.logout);

// Categories
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

// Expenses routes
router.post('/expenses', AuthMiddleware.authenticateToken, ExpenseController.addExpense);
router.get('/expenses', AuthMiddleware.authenticateToken, ExpenseController.getExpenses);
router.put('/expenses/:id', AuthMiddleware.authenticateToken, ExpenseController.updateExpense);
router.delete('/expenses/:id', AuthMiddleware.authenticateToken, ExpenseController.deleteExpense);
router.get(
  '/expenses/analytics',
  AuthMiddleware.authenticateToken,
  ExpenseController.getExpenseAnalytics
);
router.get(
  '/expenses/monthly',
  AuthMiddleware.authenticateToken,
  ExpenseController.getMonthlyExpenses
);

module.exports = router;
