export default function() {
  if (process.argv.includes('build')) return;

  // the following should not fail
  this.aver.tap('builder:before-compile-ssr', 'test');
  this.aver.tap('');
  this.aver.tap();

  this.aver.tap('builder:before-compile-ssr', ({ BODY }) => {
    BODY.splice(3, 0, '<div>node_modules</div>');
  });
}
