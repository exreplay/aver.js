import { aver, rebuild, testFeature } from '../utils/feature';

testFeature(
  'node-externals',
  () => {
    test('externals options should be set correctly', async () => {
      expect(
        aver.renderer?.webpackServerConfig.nodeExternalsOptions.allowlist
      ).toEqual(expect.arrayContaining([/\.css$/, 'test']));

      await rebuild({
        webpack: {
          nodeExternals: {
            allowlist: 'another test'
          }
        }
      });

      expect(
        aver.renderer?.webpackServerConfig.nodeExternalsOptions.allowlist
      ).toEqual(expect.arrayContaining([/\.css$/, 'another test']));

      await rebuild({
        webpack: {
          nodeExternals: {
            includeAbsolutePaths: true
          }
        }
      });

      expect(
        aver.renderer?.webpackServerConfig.nodeExternalsOptions
          .includeAbsolutePaths
      ).toBeTruthy();
    });
  },
  {
    showConsoleLogs: true,
    config: {
      webpack: {
        nodeExternals: {
          allowlist: ['test']
        }
      }
    }
  }
);
