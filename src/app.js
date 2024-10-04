/**
 * Entry point of the application
 */
const express = require('express');
const routes = require('./routes');

const app = express();

const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use('/', routes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
