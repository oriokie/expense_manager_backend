/**
 * Entry point of the application
 */
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');
require('dotenv').config();

const app = express();

// Increase the maximum number of listeners
require('events').EventEmitter.defaultMaxListeners = 15;

// Implement rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  skip: (req) => req.method === 'OPTIONS', // Skip OPTIONS requests
});
app.use(limiter);
app.options('*', cors()); // handle preflight requests

// CORS configuration
const allowedOrigins = [process.env.FRONTEND_URL, 'https://oriokie.tech', 'http://localhost:3000'];
//const allowedOrigins = [process.env.FRONTEND_URL];

app.use(
  cors({
    origin: allowedOrigins, // Your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json());

// Use routes
app.use('/', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
