import klawSync from 'klaw-sync';
import path from 'path';

export default () => {
  const templatesPath = path.resolve(__dirname, '../templates');
  const files = klawSync(templatesPath);
  const templates = [];

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
