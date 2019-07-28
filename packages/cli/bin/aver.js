#!/usr/bin/env node

const path = require('path');
const requireModule = require('esm')(module);

process.env.PROJECT_PATH = path.resolve(process.cwd(), './src');
process.env.API_PATH = path.resolve(process.cwd(), './api');

const Cli = requireModule('../lib').default;
const cli = new Cli();
cli.run();
