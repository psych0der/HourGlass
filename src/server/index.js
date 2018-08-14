/** *
 *     _   _                    _____ _
 *    | | | |                  |  __ | |
 *    | |_| | ___  _   _ _ __  | |  \| | __ _ ___ ___
 *    |  _  |/ _ \| | | | '__| | | __| |/ _` / __/ __|
 *    | | | | (_) | |_| | |    | |_\ | | (_| \__ \__ \
 *    \_| |_/\___/ \__,_|_|     \____|_|\__,_|___|___/
 *
 * Hour Glass
 * API layer
 *
 */
Promise = require('bluebird'); // eslint-disable-line no-global-assign
const { port, env } = require('./config/vars');
const app = require('./config/express');
const mongoose = require('./config/mongoose');

// open mongoose connection
mongoose.connect();

// listen to requests
app.listen(port, () =>
  console.info(` 🌎 Ready to rumble on port ${port} (${env})`)
);

/**
 * Exports express
 * @public
 */
module.exports = app;
