import { AverConfig } from '@averjs/config';
import path from 'path';

export default {
  webpack: {
    alias: {
      '@test': path.resolve(process.env.PROJECT_PATH, './test')
    }
  }
} as Partial<AverConfig>;
