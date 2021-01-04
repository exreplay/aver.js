import { aver, testFeature } from '../utils/feature';
import fs from 'fs';
import path from 'path';

testFeature(
  'service-worker',
  currentDir => {
    const serviceWorkerPath = path.resolve(
      currentDir,
      './dist/service-worker.js'
    );

    test('should generate service worker file', async () => {
      expect(fs.existsSync(serviceWorkerPath)).toBeTruthy();

      const response = await page.goto(
        'http://localhost:3000/service-worker.js'
      );
      const content = await response?.text();
      expect(response?.status()).toBe(200);
      expect(content).toContain('skipWaiting()');
      expect(content).toContain('prefix:"averjs"');
      expect(content).toContain('/^(?!\\/?api).+$/');
      expect(content).toContain('/\\.(?:png|gif|jpg|jpeg|webp|svg)$/');
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

      const response = await page.goto(
        'http://localhost:3000/service-worker.js'
      );
      const content = await response?.text();
      expect(response?.status()).toBe(200);
      expect(content).toContain('skipWaiting()');
      expect(content).toContain(`prefix:"inject_manifest"`);
    });

    test('should throw error when service-worker.js is missing', async () => {
      await aver.close();
      fs.unlinkSync(serviceWorkerPath);
      await aver.run();

      const response = await page.goto(
        'http://localhost:3000/service-worker.js'
      );
      expect(response?.status()).toBe(500);
      expect(await response?.text()).toContain(
        'ENOENT: no such file or directory'
      );
    });
  },
  { showConsoleLogs: true }
);
