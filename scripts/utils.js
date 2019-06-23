import conventionalRecommendedBump from 'conventional-recommended-bump';
import pify from 'pify';
import semver from 'semver';
import execa from 'execa';
import lernaJson from '../lerna.json';

export const getNextVersion = async(type = null) => {
  try {
    let releaseType = type;
    
    if (releaseType === null || releaseType === 'auto') {
      const { releaseType: _releaseType } = await pify(conventionalRecommendedBump)({
        preset: 'angular'
      });
      releaseType = _releaseType;
    }

    return semver.valid(releaseType) || semver.inc(lernaJson.version, releaseType);
  } catch (err) {
    throw err;
  }
};

export const exec = async(command, args, options) => {
  try {
    const {
      stdout: _stdout,
      stderr: _stderr,
      cmd: composedCommand
    } = await execa(command, args, options);

    return {
      stdout: String(_stdout).trim(),
      stderr: String(_stderr).trim(),
      composedCommand
    };
  } catch (err) {
    throw err;
  }
};
