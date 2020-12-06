import { AverConfig } from '@averjs/config';
import { defaultConfig } from '../../utils/feature';

const config: AverConfig = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...(defaultConfig(__dirname) as any),
  progressbar: {
    color: '#123',
    thickness: '5px'
  }
};

export default config;
