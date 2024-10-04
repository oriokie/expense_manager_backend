/**
 * Routes
 */
const express = require('express');

// Import the controllers
const AuthController = require('../controllers/AuthController');

// Create the router
const router = express.Router();

// Handle the request using router
router.post('/register', AuthController.register);

module.exports = router;
