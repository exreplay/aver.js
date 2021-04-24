import fs from 'fs';
import path from 'path';
import { testFeature } from '../utils/feature';

// testFeature('async-data', () => {
//   test('should fetch data before rendering component on page change', async () => {
//     const response = await page.goto('http://localhost:3000');
//     expect(await response?.text()).toContain(
//       '<div id="app" data-server-rendered="true"><div>app.vue</div><div><a href="/test">ssr</a></div></div>'
//     );
//     expect(await page.content()).toContain(
//       '<div id="app"><div>app.vue</div><div><a href="/test" class="">ssr</a></div></div>'
//     );

//     await (await page.$('a'))?.click();
//     const watchDog = page.waitForFunction('window.status === "ready"');
//     await watchDog;
//     expect(await page.content()).toContain(
//       '<div id="app"><div>app.vue</div><div><div>some async data</div><!----></div></div>'
//     );
//   });

//   test('should fetch data before ssr', async () => {
//     const response = await page.goto('http://localhost:3000/test');
//     expect(await response?.text()).toContain(
//       '<div id="app" data-server-rendered="true"><div>app.vue</div><div><div>some async data</div><!----></div></div>'
//     );
//   });

//   test('should fetch data before ssr', async () => {
//     const response = await page.goto('http://localhost:3000/test/testchild');
//     const text = await response?.text();
//     const content = await page.content();
//     expect(text).toContain(
//       '<div id="app" data-server-rendered="true"><div>app.vue</div><div><div>some async data</div><div>hello from testchild</div></div></div>'
//     );
//     expect(text).toContain(
//       '<script>window.__AVER_STATE__={asyncData:{app:{data:"app.vue"}},data:[null,{data:"hello from testchild"}]}</script>'
//     );
//     expect(content).toContain(
//       '<div id="app"><div>app.vue</div><div><div>some async data</div><div>hello from testchild</div></div></div>'
//     );
//     expect(content).toContain(
//       '<script>window.__AVER_STATE__={asyncData:{app:{data:"app.vue"}},data:[null,{data:"hello from testchild"}]}</script>'
//     );
//   });

//   test('should have the asyncData class hook registered', async () => {
//     const response = await page.goto('http://localhost:3000/test-class');
//     expect(await response?.text()).toContain(
//       '<div id="app" data-server-rendered="true"><div>app.vue</div><div>some async data</div></div>'
//     );
//   });
// });

testFeature(
  'async-data-dev',
  (currentDir) => {
    const AppPath = path.resolve(currentDir, './src/App.vue');
    const HomePath = path.resolve(currentDir, './src/pages/Home.vue');
    const HomeChildPath = path.resolve(currentDir, './src/pages/HomeChild.vue');

    const AppContent = fs.readFileSync(AppPath, 'utf-8');
    const HomeContent = fs.readFileSync(HomePath, 'utf-8');
    const HomeChildContent = fs.readFileSync(HomeChildPath, 'utf-8');

    afterAll(() => {
      fs.writeFileSync(AppPath, AppContent);
      fs.writeFileSync(HomePath, HomeContent);
      fs.writeFileSync(HomeChildPath, HomeChildContent);
    });

    test('hmr should update component and asyncData', async () => {
      const response = await page.goto('http://localhost:3000');
      expect(await response?.text()).toContain(
        '<div id="app" data-server-rendered="true"><div>app.vue</div><div><a href="/homechild">ssr</a><!----></div></div>'
      );
      expect(await page.content()).toContain(
        '<div id="app"><div>app.vue</div><div><a href="/homechild" class="">ssr</a><!----></div></div>'
      );

      let watchDog = page.waitForFunction('window.appStatus === "ready"');

      fs.writeFileSync(
        AppPath,
        `<template>
  <div id="app">
    <div>{{ data }}</div>
    <router-view />
  </div>
</template>

<script>
export default {
  data() {
    return {
      data: ''
    };
  },
  asyncData() {
    return {
      data: 'app.vue updated'
    };
  },
  metaInfo() {
    return {};
  },
  mounted() {
    window.appStatus = 'ready';
  }
};
</script>
`
      );

      await watchDog;
      expect(await page.content()).toContain(
        '<div id="app"><div>app.vue updated</div><div><a href="/homechild" class="">ssr</a><!----></div></div>'
      );

      watchDog = page.waitForFunction('window.homeStatus === "ready"');

      fs.writeFileSync(
        HomePath,
        `<template>
  <div>
    <router-link :to="{ name: 'homechild' }">{{ test }}</router-link>
    <router-view />
  </div>
</template>

<script>
export default {
  data() {
    return {
      test: ''
    };
  },
  asyncData() {
    return {
      test: 'ssr updated'
    };
  },
  mounted() {
    window.homeStatus = 'ready';
  }
};
</script>
`
      );

      await watchDog;
      expect(await page.content()).toContain(
        '<div id="app"><div>app.vue updated</div><div><a href="/homechild" class="">ssr updated</a><!----></div></div>'
      );

      await (await page.$('a'))?.click();
      watchDog = page.waitForFunction('window.status === "ready"');
      await watchDog;

      expect(await page.content()).toContain(
        '<div id="app"><div>app.vue updated</div><div><a href="/homechild" class="router-link-exact-active router-link-active" aria-current="page">ssr updated</a><div>homechild</div></div></div>'
      );

      watchDog = page.waitForFunction('window.homeChildStatus === "ready"');

      fs.writeFileSync(
        HomeChildPath,
        `<template>
  <div>{{ data }}</div>
</template>

<script>
export default {
  asyncData() {
    return {
      data: 'homechild updated'
    };
  },
  data() {
    return {
      data: ''
    };
  },
  mounted() {
    window.homeChildStatus = 'ready';
  }
};
</script>
`
      );

      await watchDog;
      expect(await page.content()).toContain(
        '<div id="app"><div>app.vue updated</div><div><a href="/homechild" class="router-link-exact-active router-link-active" aria-current="page">ssr updated</a><div>homechild updated</div></div></div>'
      );
    });
  },
  { dev: true, showConsoleLogs: true }
);
