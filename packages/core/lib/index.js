const path = require('path');

/**
 * Remove in next major version, where a index.js file in root directory is not needed anymore.
 * Those variables are defined in the executable in the cli package.
 */
process.env.PROJECT_PATH = path.resolve(process.cwd(), './src');
process.env.API_PATH = path.resolve(process.cwd(), './api');

module.exports = require('./core.js');
