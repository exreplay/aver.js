#!/usr/bin/env node
/* eslint-disable */

const path = require('path');

process.env.PROJECT_PATH = path.resolve(process.cwd(), './src');
process.env.API_PATH = path.resolve(process.cwd(), './api');

const t = require('ts-node');
t.register({
  project: path.resolve(process.env.PROJECT_PATH, '../tsconfig.server.json')
});

const RuntimeCli = require('../dist/typescript-runtime');
const cli = new RuntimeCli();
cli.avercli.run().catch(error => console.log(error));
