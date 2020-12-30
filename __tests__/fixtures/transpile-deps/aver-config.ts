import { AverConfig } from '@averjs/config';

const config: Partial<AverConfig> = {
  webpack: {
    transpileDependencies: ['package-to-transpile']
  }
};

export default config;
