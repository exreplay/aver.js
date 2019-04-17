# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.5.0](https://github.com/exreplay/aver.js/compare/v1.4.0...v1.5.0) (2019-04-17)


### Bug Fixes

* **renderer:** updated friendly-errors-webpack-plugin usage ([3feaaf0](https://github.com/exreplay/aver.js/commit/3feaaf0))
* **renderer:** use hooks instead of deprecated plugin webpack api ([69e8caf](https://github.com/exreplay/aver.js/commit/69e8caf))


### Features

* **csrf:** csrf can now be disabled ([a805cc5](https://github.com/exreplay/aver.js/commit/a805cc5))





# [1.4.0](https://github.com/exreplay/aver.js/compare/v1.3.0...v1.4.0) (2019-04-07)


### Bug Fixes

* **deps:** update babel monorepo to v7.4.3 ([04e031d](https://github.com/exreplay/aver.js/commit/04e031d))
* **deps:** update dependency extract-css-chunks-webpack-plugin to v4.3.0 ([94dc1df](https://github.com/exreplay/aver.js/commit/94dc1df))
* **deps:** update dependency mongoose to v5.4.21 ([6a50c2c](https://github.com/exreplay/aver.js/commit/6a50c2c))
* **deps:** update dependency mongoose to v5.4.22 ([44d2a5f](https://github.com/exreplay/aver.js/commit/44d2a5f))
* **deps:** update dependency nodemailer to v6.1.0 ([7272c1b](https://github.com/exreplay/aver.js/commit/7272c1b))
* **deps:** update dependency ora to v3.4.0 ([06d3432](https://github.com/exreplay/aver.js/commit/06d3432))
* **deps:** update dependency webpack-dev-middleware to v3.6.2 ([dec64ba](https://github.com/exreplay/aver.js/commit/dec64ba))
* **deps:** update dependency workbox-webpack-plugin to v4.2.0 ([4c27c8c](https://github.com/exreplay/aver.js/commit/4c27c8c))
* **vue-app:** added main attribute to package.json ([991951f](https://github.com/exreplay/aver.js/commit/991951f))


### Features

* **vue-app:** added new package vue-app ([f2d36f2](https://github.com/exreplay/aver.js/commit/f2d36f2))
* added new package shared-utils ([9e8ca05](https://github.com/exreplay/aver.js/commit/9e8ca05))
* added open browser script ([6bcd6f6](https://github.com/exreplay/aver.js/commit/6bcd6f6))





# [1.3.0](https://github.com/exreplay/aver.js/compare/v1.2.1...v1.3.0) (2019-04-02)


### Bug Fixes

* **core:** entry-server now throws a proper error on 404 ([b19e282](https://github.com/exreplay/aver.js/commit/b19e282))
* **deps:** update dependency eslint-plugin-promise to v4.1.1 ([5bb066f](https://github.com/exreplay/aver.js/commit/5bb066f))
* **deps:** update dependency ora to v3.3.0 ([80a7900](https://github.com/exreplay/aver.js/commit/80a7900))
* **mailer:** transporter was not logging right error object if verify fails ([efd3046](https://github.com/exreplay/aver.js/commit/efd3046))


### Features

* passing i18n object to router ([7a170c0](https://github.com/exreplay/aver.js/commit/7a170c0))





## [1.2.1](https://github.com/exreplay/aver.js/compare/v1.2.0...v1.2.1) (2019-03-31)


### Bug Fixes

* **core:** rotating-file-stream had wrong config param ([bfa1581](https://github.com/exreplay/aver.js/commit/bfa1581))





# [1.2.0](https://github.com/exreplay/aver.js/compare/v1.1.1...v1.2.0) (2019-03-31)


### Bug Fixes

* **config:** use lodash/merge instead of Object.assign for deep merge ([ba0b6ac](https://github.com/exreplay/aver.js/commit/ba0b6ac))
* **deps:** update dependency eslint to v5.16.0 ([d27d012](https://github.com/exreplay/aver.js/commit/d27d012))
* **deps:** update dependency esm to v3.2.22 ([8523c6d](https://github.com/exreplay/aver.js/commit/8523c6d))
* **deps:** update dependency nodemailer to v6 ([72ed28e](https://github.com/exreplay/aver.js/commit/72ed28e))
* **deps:** update dependency vue-meta to v1.6.0 ([fefbf9b](https://github.com/exreplay/aver.js/commit/fefbf9b))
* **renderer:** compilers was still pointing to class property instead of the local property ([b07d7b2](https://github.com/exreplay/aver.js/commit/b07d7b2))


### Features

* **renderer:** added style-resources-loader ([f58d003](https://github.com/exreplay/aver.js/commit/f58d003))





## [1.1.1](https://github.com/exreplay/aver.js/compare/v1.1.0...v1.1.1) (2019-03-30)


### Bug Fixes

* **deps:** pin dependency klaw-sync to 6.0.0 ([b1c2ece](https://github.com/exreplay/aver.js/commit/b1c2ece))
* **renderer:** changed mkdirSync to mkdirpSync ([3c8692e](https://github.com/exreplay/aver.js/commit/3c8692e))





# [1.1.0](https://github.com/exreplay/aver.js/compare/v1.0.35...v1.1.0) (2019-03-30)


### Bug Fixes

* corejs warning is no longer showing ([96029f7](https://github.com/exreplay/aver.js/commit/96029f7))


### Features

* use lodash template for vue-app ([332a71d](https://github.com/exreplay/aver.js/commit/332a71d))





## [1.0.35](https://github.com/exreplay/aver.js/compare/v1.0.34...v1.0.35) (2019-03-29)


### Bug Fixes

* **babel-preset-app:** added core-js as dependency to prevent warning ([98a1fc1](https://github.com/exreplay/aver.js/commit/98a1fc1))
* **deps:** update dependency extract-css-chunks-webpack-plugin to v4.2.0 ([050e363](https://github.com/exreplay/aver.js/commit/050e363))
* **deps:** update dependency ioredis to v4.9.0 ([6bbb067](https://github.com/exreplay/aver.js/commit/6bbb067))
* **deps:** update dependency vue-i18n to v8.10.0 ([3828217](https://github.com/exreplay/aver.js/commit/3828217))
* **renderer:** moved InjectManifest config after global config ([425efd6](https://github.com/exreplay/aver.js/commit/425efd6))





## [1.0.34](https://github.com/exreplay/aver.js/compare/v1.0.33...v1.0.34) (2019-03-28)


### Bug Fixes

* **deps:** update dependency mongoose to v5.4.20 ([828d01f](https://github.com/exreplay/aver.js/commit/828d01f))
* **deps:** update dependency vue-class-component to v7.0.2 ([1b3541c](https://github.com/exreplay/aver.js/commit/1b3541c))
* **deps:** update dependency webpack-chain to v5.2.4 ([7275e9c](https://github.com/exreplay/aver.js/commit/7275e9c))
* **renderer:** assign global config last to serviceworker to prevent that it gets overwritten ([7878c00](https://github.com/exreplay/aver.js/commit/7878c00))


### Features

* added eslint [#2](https://github.com/exreplay/aver.js/issues/2) ([a2f90cc](https://github.com/exreplay/aver.js/commit/a2f90cc))





## [1.0.33](https://github.com/exreplay/aver.js/compare/v1.0.32...v1.0.33) (2019-03-24)

**Note:** Version bump only for package averjs





## [1.0.32](https://github.com/exreplay/aver.js/compare/v1.0.31...v1.0.32) (2019-03-24)


### Bug Fixes

* fixed core package to use exact versions in package.json ([4a3ee9c](https://github.com/exreplay/aver.js/commit/4a3ee9c))





## [1.0.31](https://github.com/exreplay/aver.js/compare/v1.0.30...v1.0.31) (2019-03-24)

**Note:** Version bump only for package averjs





## [1.0.30](https://github.com/exreplay/aver.js/compare/v1.0.29...v1.0.30) (2019-03-24)

**Note:** Version bump only for package averjs
