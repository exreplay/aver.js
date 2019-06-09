const path = require('path');
const requireModule = require('esm')(module);

process.env.PROJECT_PATH = path.resolve(process.cwd(), './src');
process.env.API_PATH = path.resolve(process.cwd(), './api');

module.exports = requireModule('./core.js').default;
