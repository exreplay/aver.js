# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.0.0-2](https://github.com/exreplay/aver.js/compare/v2.0.0-1...v2.0.0-2) (2019-09-18)


### Bug Fixes

* **renderer:** removed unnecessary includes in js rule ([ec18917](https://github.com/exreplay/aver.js/commit/ec18917))





# [2.0.0-1](https://github.com/exreplay/aver.js/compare/v2.0.0-0...v2.0.0-1) (2019-09-03)

**Note:** Version bump only for package @averjs/renderer





# [2.0.0-0](https://github.com/exreplay/aver.js/compare/v1.5.3...v2.0.0-0) (2019-09-03)


### Bug Fixes

* **renderer:** load postcss config correctly ([#92](https://github.com/exreplay/aver.js/issues/92)) ([f37724d](https://github.com/exreplay/aver.js/commit/f37724d))
* **renderer:** reuse browser tabs when port 80 is defined ([7631a21](https://github.com/exreplay/aver.js/commit/7631a21))


### Features

* **renderer:** added new config param process.env ([27fe2e7](https://github.com/exreplay/aver.js/commit/27fe2e7))
* add rollup to build packages ([#56](https://github.com/exreplay/aver.js/issues/56)) ([537faa6](https://github.com/exreplay/aver.js/commit/537faa6))
* added FilesChanged plugin ([8b8dc98](https://github.com/exreplay/aver.js/commit/8b8dc98))
* vuex store config ([#95](https://github.com/exreplay/aver.js/issues/95)) ([b47ae0c](https://github.com/exreplay/aver.js/commit/b47ae0c))





## [1.5.3](https://github.com/exreplay/aver.js/compare/v1.5.2...v1.5.3) (2019-06-13)


### Bug Fixes

* **renderer:** purgeCss was checked on undefined which was always true ([5b021c6](https://github.com/exreplay/aver.js/commit/5b021c6))





## [1.5.2](https://github.com/exreplay/aver.js/compare/v1.5.1...v1.5.2) (2019-04-18)

**Note:** Version bump only for package @averjs/renderer





## [1.5.1](https://github.com/exreplay/aver.js/compare/v1.5.0...v1.5.1) (2019-04-18)

**Note:** Version bump only for package @averjs/renderer





# [1.5.0](https://github.com/exreplay/aver.js/compare/v1.4.0...v1.5.0) (2019-04-18)


### Bug Fixes

* **renderer:** updated friendly-errors-webpack-plugin usage ([3feaaf0](https://github.com/exreplay/aver.js/commit/3feaaf0))
* **renderer:** use hooks instead of deprecated plugin webpack api ([69e8caf](https://github.com/exreplay/aver.js/commit/69e8caf))


### Features

* **csrf:** csrf can now be disabled ([a805cc5](https://github.com/exreplay/aver.js/commit/a805cc5))





# [1.4.0](https://github.com/exreplay/aver.js/compare/v1.3.0...v1.4.0) (2019-04-07)


### Bug Fixes

* **deps:** update dependency extract-css-chunks-webpack-plugin to v4.3.0 ([94dc1df](https://github.com/exreplay/aver.js/commit/94dc1df))
* **deps:** update dependency ora to v3.4.0 ([06d3432](https://github.com/exreplay/aver.js/commit/06d3432))
* **deps:** update dependency webpack-dev-middleware to v3.6.2 ([dec64ba](https://github.com/exreplay/aver.js/commit/dec64ba))
* **deps:** update dependency workbox-webpack-plugin to v4.2.0 ([4c27c8c](https://github.com/exreplay/aver.js/commit/4c27c8c))
* **vue-app:** added main attribute to package.json ([991951f](https://github.com/exreplay/aver.js/commit/991951f))


### Features

* **vue-app:** added new package vue-app ([f2d36f2](https://github.com/exreplay/aver.js/commit/f2d36f2))
* added open browser script ([6bcd6f6](https://github.com/exreplay/aver.js/commit/6bcd6f6))





# [1.3.0](https://github.com/exreplay/aver.js/compare/v1.2.1...v1.3.0) (2019-04-02)


### Bug Fixes

* **deps:** update dependency eslint-plugin-promise to v4.1.1 ([5bb066f](https://github.com/exreplay/aver.js/commit/5bb066f))
* **deps:** update dependency ora to v3.3.0 ([80a7900](https://github.com/exreplay/aver.js/commit/80a7900))





## [1.2.1](https://github.com/exreplay/aver.js/compare/v1.2.0...v1.2.1) (2019-03-31)

**Note:** Version bump only for package @averjs/renderer





# [1.2.0](https://github.com/exreplay/aver.js/compare/v1.1.1...v1.2.0) (2019-03-31)


### Bug Fixes

* **deps:** update dependency eslint to v5.16.0 ([d27d012](https://github.com/exreplay/aver.js/commit/d27d012))
* **renderer:** compilers was still pointing to class property instead of the local property ([b07d7b2](https://github.com/exreplay/aver.js/commit/b07d7b2))


### Features

* **renderer:** added style-resources-loader ([f58d003](https://github.com/exreplay/aver.js/commit/f58d003))





## [1.1.1](https://github.com/exreplay/aver.js/compare/v1.1.0...v1.1.1) (2019-03-30)


### Bug Fixes

* **deps:** pin dependency klaw-sync to 6.0.0 ([b1c2ece](https://github.com/exreplay/aver.js/commit/b1c2ece))
* **renderer:** changed mkdirSync to mkdirpSync ([3c8692e](https://github.com/exreplay/aver.js/commit/3c8692e))





# [1.1.0](https://github.com/exreplay/aver.js/compare/v1.0.35...v1.1.0) (2019-03-30)


### Features

* use lodash template for vue-app ([332a71d](https://github.com/exreplay/aver.js/commit/332a71d))





## [1.0.35](https://github.com/exreplay/aver.js/compare/v1.0.34...v1.0.35) (2019-03-29)


### Bug Fixes

* **deps:** update dependency extract-css-chunks-webpack-plugin to v4.2.0 ([050e363](https://github.com/exreplay/aver.js/commit/050e363))
* **renderer:** moved InjectManifest config after global config ([425efd6](https://github.com/exreplay/aver.js/commit/425efd6))





## [1.0.34](https://github.com/exreplay/aver.js/compare/v1.0.33...v1.0.34) (2019-03-28)


### Bug Fixes

* **deps:** update dependency webpack-chain to v5.2.4 ([7275e9c](https://github.com/exreplay/aver.js/commit/7275e9c))
* **renderer:** assign global config last to serviceworker to prevent that it gets overwritten ([7878c00](https://github.com/exreplay/aver.js/commit/7878c00))





## [1.0.33](https://github.com/exreplay/aver.js/compare/v1.0.32...v1.0.33) (2019-03-24)

**Note:** Version bump only for package @averjs/renderer





## [1.0.31](https://github.com/exreplay/aver.js/compare/v1.0.30...v1.0.31) (2019-03-24)

**Note:** Version bump only for package @averjs/renderer





## [1.0.30](https://github.com/exreplay/aver.js/compare/v1.0.29...v1.0.30) (2019-03-24)

**Note:** Version bump only for package @averjs/renderer
