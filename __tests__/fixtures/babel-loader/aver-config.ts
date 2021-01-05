import { AverConfig } from '@averjs/config';

const config: AverConfig = {
  webpack: {
    transpileDependencies: ['package-to-transpile']
  }
};

export default config;
