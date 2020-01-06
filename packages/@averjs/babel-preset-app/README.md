# @averjs/babel-preset-app

> Be aware that this plugin is designed to be used with averjs and there is no guarantee to work anywhere else.

## Usage

This is the default babel preset for averjs. It includes the following plugins:

- @babel/plugin-syntax-dynamic-import
- @babel/plugin-proposal-decorators
- @babel/plugin-proposal-class-properties
- @babel/plugin-transform-classes

The default behavior for polyfilling is to use core-js 2. This is also the recommended and preinstalled version for now. We do have the plugin prepared for version 3 usage and if you would like to use it, jump to the core-js 3 section.

## core-js 3

First install the following packages. Be aware that those should be installed in the root of your project.

```bash
yarn add --dev core-js@3 @babel/runtime-corejs3
```

The last thing to do is to set the corejs version in the babel config param.

```js

export default {
  webpack: {
    babel: {
      corejs: 3
    }
  }
}

```