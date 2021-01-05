export default function() {
  if (process.argv.includes('build')) return;

  this.aver.tap('builder:before-compile-ssr', ({ BODY }) => {
    BODY.splice(3, 0, '<div>project</div>');
  });
}
