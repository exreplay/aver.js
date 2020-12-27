import fs from 'fs';
import path from 'path';

export default function({ msg }) {
  fs.writeFileSync(
    path.resolve(process.env.PROJECT_PATH, './build.js'),
    `export default '${msg}';\n`,
    'utf-8'
  );
}
