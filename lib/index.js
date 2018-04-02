const requireModule = require('esm')(module);
const path = require('path');
process.env.PROJECT_PATH = path.resolve(process.cwd(), 'src');
module.exports = requireModule('./core.js').default;
