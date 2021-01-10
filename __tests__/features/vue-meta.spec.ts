import { rebuild, testFeature } from '../utils/feature';
import fs from 'fs';
import path from 'path';

testFeature('vue-meta', (currentDir) => {
  test('should render vue-meta stuff correctly', async () => {
    await page.goto('http://localhost:3000');
    const content = await page.content();

    /**
     * attrs
     */
    expect(content).toContain('html lang="en"');
    expect(content).toContain('head class="head"');
    expect(content).toContain('body class="body"');

    /**
     * head
     */
    expect(content).toContain(
      '<meta data-vue-meta="1" name="description" content="test">'
    );
    expect(content).toContain('<title>home</title>');
    expect(content).toContain(
      '<link data-vue-meta="1" rel="stylesheet" href="https://fonts.googleapis.com/css?family=Nunito+Sans:400,700,900">'
    );
    expect(content).toContain(
      '<style data-vue-meta="1" type="text/css">.head{color:red}</style>'
    );
    expect(content).toContain(
      '<script data-vue-meta="1" type="text/javascript">console.log("I am in head")</script>'
    );
    expect(content).toContain(
      '<noscript data-vue-meta="1">i am in head</noscript>'
    );

    /**
     * pbody
     */
    expect(content).toContain(
      '<style data-vue-meta="1" type="text/css" data-pbody="true">.pbody{color:red}</style>'
    );
    expect(content).toContain(
      '<script data-vue-meta="1" type="text/javascript" data-pbody="true">console.log("I am in pbody")</script>'
    );
    expect(content).toContain(
      '<noscript data-vue-meta="1" data-pbody="true">i am in pbody</noscript>'
    );

    /**
     * body
     */
    expect(content).toContain(
      '<style data-vue-meta="1" type="text/css" data-body="true">.body{color:red}</style>'
    );
    expect(content).toContain(
      '<script data-vue-meta="1" type="text/javascript" data-body="true">console.log("I am body")</script>'
    );
    expect(content).toContain(
      '<noscript data-vue-meta="1" data-body="true">i am in body</noscript>'
    );
  });

  test('should render vue-meta stuff correctly in static mode', async () => {
    await rebuild({}, { static: true });

    const content = fs.readFileSync(
      path.resolve(currentDir, './dist/index.html'),
      'utf-8'
    );

    /**
     * attrs
     */
    expect(content).toContain('html data-vue-meta-server-rendered lang="en"');
    expect(content).toContain('head class="head"');
    expect(content).toContain('body class="body"');

    /**
     * head
     */
    expect(content).toContain(
      '<meta data-vue-meta="1" name="description" content="test">'
    );
    expect(content).toContain('<title>home</title>');
    expect(content).toContain(
      '<link data-vue-meta="1" rel="stylesheet" href="https://fonts.googleapis.com/css?family=Nunito+Sans:400,700,900">'
    );
    expect(content).toContain(
      '<style data-vue-meta="1" type="text/css">.head{color:red}</style>'
    );
    expect(content).toContain(
      '<script data-vue-meta="1" type="text/javascript">console.log("I am in head")</script>'
    );
    expect(content).toContain(
      '<noscript data-vue-meta="1">i am in head</noscript>'
    );

    /**
     * pbody
     */
    expect(content).toContain(
      '<style data-vue-meta="1" type="text/css" data-pbody="true">.pbody{color:red}</style>'
    );
    expect(content).toContain(
      '<script data-vue-meta="1" type="text/javascript" data-pbody="true">console.log("I am in pbody")</script>'
    );
    expect(content).toContain(
      '<noscript data-vue-meta="1" data-pbody="true">i am in pbody</noscript>'
    );

    /**
     * body
     */
    expect(content).toContain(
      '<style data-vue-meta="1" type="text/css" data-body="true">.body{color:red}</style>'
    );
    expect(content).toContain(
      '<script data-vue-meta="1" type="text/javascript" data-body="true">console.log("I am body")</script>'
    );
    expect(content).toContain(
      '<noscript data-vue-meta="1" data-body="true">i am in body</noscript>'
    );
  });
});
