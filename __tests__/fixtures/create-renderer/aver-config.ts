import { defaultConfig } from '../../utils/feature';
import { AverConfig } from '@averjs/config';

type NodeStyle =
  | Partial<CSSStyleDeclaration>
  | Partial<CSSStyleDeclaration>[]
  | string
  | undefined;

const config: Partial<AverConfig> = {
  ...defaultConfig(__dirname),
  createRenderer: {
    directives: {
      hidden(node) {
        if (!node.data) return;

        const style = (node.data.style as NodeStyle) || (node.data.style = {});

        if (Array.isArray(style)) style.push({ opacity: '0' });
        else if (style && typeof style !== 'string') style.opacity = '0';
      }
    }
  }
};

export default config;
