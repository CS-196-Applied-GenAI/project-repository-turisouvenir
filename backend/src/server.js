/**
 * Entry point: load config, create app, listen on PORT.
 * Database pool is created on first use (e.g. first API call that needs DB).
 */
const app = require('./app');
const config = require('./config');

const server = app.listen(config.port, () => {
  console.log(`Server listening on port ${config.port}`);
});

module.exports = server;
