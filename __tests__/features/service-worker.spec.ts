import { aver, testFeature } from '../utils/feature';
import fs from 'fs';
import path from 'path';

testFeature('service-worker', currentDir => {
  const serviceWorkerPath = path.resolve(
    currentDir,
    './dist/service-worker.js'
  );

  test('should generate service worker file', async () => {
    expect(fs.existsSync(serviceWorkerPath)).toBeTruthy();

    const content = fs.readFileSync(serviceWorkerPath, 'utf-8');
    expect(content).toContain('skipWaiting();');
    expect(content).toContain(
      `setCacheNameDetails({
  prefix: "averjs"
});`
    );
    expect(content).toContain(
      "registerRoute(/^(?!\\/?api).+$/, new NetworkFirst(), 'GET');"
    );
    expect(content).toContain(
      "registerRoute(/\\.(?:png|gif|jpg|jpeg|webp|svg)$/, new CacheFirst(), 'GET');"
    );

    const response = await page.goto('http://localhost:3000/service-worker.js');
    expect(response?.status()).toBe(200);
  });

  test('should work with inject manifest', async () => {
    await aver.close();
    if (aver.config.webpack?.sw)
      aver.config.webpack.sw = {
        mode: 'InjectManifest',
        swSrc: './service-worker.js',
        exclude: [/\.(?:png|gif|jpg|jpeg|webp)$/, /\.mp4$/, /\.pdf$/]
      };

    await aver.build({});
    await aver.run();

    expect(fs.existsSync(serviceWorkerPath)).toBeTruthy();

    const content = fs.readFileSync(serviceWorkerPath, 'utf-8');
    expect(content).toContain('skipWaiting();');
    expect(content).toContain(
      `setCacheNameDetails({
  prefix: 'inject_manifest'
});`
    );
    expect(content).toContain('precacheAndRoute([');

    const response = await page.goto('http://localhost:3000/service-worker.js');
    expect(response?.status()).toBe(200);
  });
});
