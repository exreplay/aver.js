#!/usr/bin/env node
const path = require('path');

process.env.PROJECT_PATH = path.resolve(process.cwd(), './src');
process.env.API_PATH = path.resolve(process.cwd(), './api');

const { CLI } = require('../dist/typescript');
const cli = new CLI();
cli.run();
