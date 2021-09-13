export interface AverAppConfig {
  openBrowser?: boolean;
  progressbar?:
    | {
        color?: string;
        failedColor?: string;
        thickness?: string;
        transition?: {
          speed?: string;
          opacity?: string;
          termination?: number;
        };
        autoRevert?: boolean;
        location?: 'left' | 'right' | 'top' | 'bottom';
        position?: 'relative' | 'absolute' | 'fixed';
        inverse?: boolean;
        autoFinish?: boolean;
      }
    | boolean;
}

export default (): AverAppConfig => ({
  openBrowser: true,
  progressbar: true
});
