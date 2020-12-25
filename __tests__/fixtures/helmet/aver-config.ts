import { defaultConfig } from '../../utils/feature';
import { AverConfig } from '@averjs/config';

const config: Partial<AverConfig> = {
  ...defaultConfig(__dirname),
  helmet: {
    referrerPolicy: false
  }
};

export default config;
