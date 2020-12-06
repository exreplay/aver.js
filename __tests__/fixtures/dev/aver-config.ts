import { AverConfig } from '@averjs/config';
import { defaultConfig } from '../../utils/feature';

const config: AverConfig = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...(defaultConfig(__dirname) as any)
};

export default config;
