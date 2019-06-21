import conventionalRecommendedBump from 'conventional-recommended-bump';
import pify from 'pify';
import semver from 'semver';
import execa from 'execa';
import lernaJson from '../lerna.json';

export const getNextVersion = async() => {
  try {
    const { releaseType } = await pify(conventionalRecommendedBump)({
      preset: 'angular'
    });

    return semver.valid(releaseType) || semver.inc(lernaJson.version, releaseType);
  } catch (err) {
    throw err;
  }
};

export const exec = async(command, ...args) => {
  try {
    const {
      stdout: _stdout,
      stderr: _stderr,
      cmd: composedCommand
    } = await execa(command, args);

    return {
      stdout: String(_stdout).trim(),
      stderr: String(_stderr).trim(),
      composedCommand
    };
  } catch (err) {
    throw err;
  }
};
