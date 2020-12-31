import { AverConfig } from '@averjs/config/lib';

const config: Partial<AverConfig> = {
  webpack: {
    css: {
      extract: false
    }
  }
};

export default config;
