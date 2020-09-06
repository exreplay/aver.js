import klawSync from 'klaw-sync';
import path from 'path';

export interface Templates {
  src: string;
  dst: string;
  pluginPath?: string;
  dirname?: string
}

export default () => {
  const templatesPath = path.resolve(__dirname, '../templates');
  const files = klawSync(templatesPath);
  const templates: Templates[] = [];

  for (const file of files) {
    if (!file.stats.isDirectory()) {
      templates.push({
        src: file.path,
        dst: path.relative(templatesPath, file.path)
      });
    }
  }

  return templates;
};
