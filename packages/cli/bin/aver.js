#!/usr/bin/env node

const requireModule = require('esm')(module);
const Cli = requireModule('../lib').default;
const cli = new Cli();
cli.run();
