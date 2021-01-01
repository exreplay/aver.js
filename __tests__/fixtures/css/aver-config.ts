import { AverConfig } from '@averjs/config/lib';
import precss from 'precss';

export default {
  webpack: {
    postcss: {
      plugins: {
        precss
      }
    },
    css: {
      extract: false
    }
  }
} as Partial<AverConfig>;
