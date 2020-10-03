#!/usr/bin/env node
const path = require('path');

process.env.PROJECT_PATH = path.resolve(process.cwd(), './src');
process.env.API_PATH = path.resolve(process.cwd(), './api');

const RuntimeCli = require('../dist/typescript-runtime');
const cli = new RuntimeCli();
cli.run();
