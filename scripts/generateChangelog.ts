import fs from 'fs';
import path from 'path';
import { exec } from './utils';

async function generateChangelog() {
  const { version: nextVersion } = await import('../lerna.json');
  const { stdout } = await exec(require.resolve('lerna-changelog/bin/cli'), [
    '--next-version',
    nextVersion
  ]);
  return stdout;
}

async function writeChangelog() {
  const changelog = await generateChangelog();
  const changelogPath = path.resolve(__dirname, '../CHANGELOG.md');
  const currentChangelog = fs.readFileSync(changelogPath, 'utf-8');
  const newChangelog = changelog + '\n\n\n' + currentChangelog;
  fs.writeFileSync(changelogPath, newChangelog);
}

(async () => {
  try {
    await writeChangelog();
  } catch (error) {
    console.log(error);
  }
})();
