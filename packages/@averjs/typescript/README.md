# @averjs/typescript

Official aver package for typescript support.

## Usage

Install the package

```bash
$ yarn add --dev @averjs/typescript
#or
$ npm i -D @nuxtjs/typescript
```

Add the plugin to the `buildPlugins` array inside your aver-config.ts

```js
export default {
  buildPlugins: [
    '@averjs/typescript'
  ]
}
```

## Options

You can pass either one of the following options to the plugin

```js
export default {
  buildPlugins: [
    [
      '@averjs/typescript',
      {
        tsLoader: {},
        // or
        tsLoader: (default) => ({ ...default, /* add additional config */ }),

        forkTsChecker: {},
        // or
        forkTsChecker: (default) => ({ ...default, /* add additional config */ }),
      }
    ]
  ]
}
```

### tsLoader

- Type: `object | function`
- Default:
  ```js
  {
    transpileOnly: true,
    happyPackMode: true,
    appendTsSuffixTo: [/\.vue$/]
  }
  ```

You can either pass an object with the loader options, which can be found [here](https://github.com/TypeStrong/ts-loader#loader-options), or you can also use a function which is getting passed the default config, can be modified and should return a valid config.

### forkTsChecker

- Type: `object | function`
- Default:
  ```js
  {
    typescript: {
      configFile: path.resolve(process.env.PROJECT_PATH, '../tsconfig.json'),
      extensions: {
        vue: true
      }
    },
    formatter: 'codeframe',
    async: false,
    eslint: {
      files: [
        './src/**/*.vue',
        './src/**/*.ts'
      ]
    }
  }
  ```

You can either pass an object with the plugin options, which can be found [here](https://github.com/TypeStrong/fork-ts-checker-webpack-plugin#options), or you can also use a function which is getting passed the default config, can be modified and should return a valid config.