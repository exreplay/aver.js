const webpack = require('webpack');
const chalk = require('chalk');
const _ = require('lodash');
const ora = require('ora');
const spinner = ora({
    color: 'green',
    interval: 50
});

const sharedState = {};

const BLOCK_CHAR = '█';

module.exports = class ProgressPlugin extends webpack.ProgressPlugin {
    constructor(options) {
        super(options);

        this.handler = (percent, msg, ...details) => this.updateProgress(percent, msg, details);

        this.options = options;
        this.outputWritten = false;

        if (!sharedState[options.name]) {
            sharedState[options.name] = {
                color: options.color
            }
        }
    }

    get state() {
        return sharedState[this.options.name];
    }

    updateProgress(percent, msg, details) {
        const progress = Math.floor(percent * 100);
        const chars = 30;

        this.state.progress = progress;
        this.state.msg = msg;

        const bars = Object.keys(sharedState).map(name => {
            const state = sharedState[name];

            return {
                name,
                progress: state.progress,
                msg: state.msg,
                blockChar: chalk.keyword(state.color)(BLOCK_CHAR)
            }
        });

        const barsOutput = [];
        _.forEach(bars, bar => {
            const progressbar = _.range(chars).fill(chalk.white(BLOCK_CHAR));
            const current = chars * bar.progress / 100;

            for(let i = 0; i < current; i++) {
                progressbar[i] = bar.blockChar;
            }

            barsOutput.push('\t' + bar.name + '\t' +  progressbar.join('') + ' ' + bar.progress + '%' + '\t' + _.startCase(msg));
        });

        const progressCombined = _.reduce(bars, (sum, bar) => sum + bar.progress, 0);

        spinner.start();
        spinner.text = barsOutput.join('\n');

        if(progressCombined === bars.length*100) {
            spinner.succeed(barsOutput.join('\n') + '\n\n' + '\tCompiled successfully' + '\n');
            return;
        }
    }
}