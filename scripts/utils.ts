import conventionalRecommendedBump from 'conventional-recommended-bump';
import pify from 'pify';
import semver, { ReleaseType as SemverReleaseType } from 'semver';
import execa from 'execa';
import lernaJson from '../lerna.json';

export type ReleaseType = SemverReleaseType | 'auto';

export const getNextVersion = async (type?: ReleaseType) => {
  let releaseType = type;

  if (!releaseType) return lernaJson.version;

  if (releaseType === 'auto') {
    const { releaseType: _releaseType } = (await pify(
      conventionalRecommendedBump
    )({
      preset: 'angular'
    })) as conventionalRecommendedBump.Callback.Recommendation;
    releaseType = _releaseType;
  }

  return (
    semver.valid(releaseType) ||
    (releaseType && semver.inc(lernaJson.version, releaseType))
  );
};

export const exec = async (
  command: string,
  args: string[],
  options?: execa.Options
) => {
  const {
    stdout: _stdout,
    stderr: _stderr,
    command: composedCommand
  } = await execa(command, args, options);

  return {
    stdout: String(_stdout).trim(),
    stderr: String(_stderr).trim(),
    composedCommand
  };
};
