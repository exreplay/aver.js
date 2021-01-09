import { AverConfig } from '@averjs/config';

const config: AverConfig = {
  webpack: {
    sw: {
      skipWaiting: true,
      exclude: [/\.(?:png|gif|jpg|jpeg|webp)$/],
      runtimeCaching: [
        {
          urlPattern: /^(?!\/?api).+$/,
          handler: 'NetworkFirst'
        },
        {
          urlPattern: /\.(?:png|gif|jpg|jpeg|webp|svg)$/,
          handler: 'CacheFirst'
        }
      ]
    }
  }
};

export default config;
