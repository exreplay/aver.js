#!/usr/bin/env node
/* eslint-disable */

const path = require('path');

process.env.PROJECT_PATH = path.resolve(process.cwd(), './src');
process.env.API_PATH = path.resolve(process.cwd(), './api');

const Cli = require('../dist/cli');
const cli = new Cli();
cli.run();
