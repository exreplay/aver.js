const path = require('path');

process.env.PROJECT_PATH = path.resolve(process.cwd(), './src');
process.env.API_PATH = path.resolve(process.cwd(), './api');

module.exports = require('./core.js');
