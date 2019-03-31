# aver.js
<p align="center">
    <a href="https://www.npmjs.com/package/@averjs/core"><img src="https://badgen.net/npm/v/@averjs/core" alt="Version"></a>
</p>

## Vue Server Side Rendering

This plugin has everything you need to start a new Vue project which is capable of server side rendering.  

### Installation

The `@averjs/core` holds the core with express and all the other stuff which is necessary for server side rendering. And than there is `@averjs/renderer` for all the webpack stuff. The 2 packages are seperated so you are able to have the rendering stuff in the `devDependencies` and therefore it is not getting installed in production. 

To install both, execute the following commands inside a new and empty directory.
```bash
yarn add @averjs/core
yarn add --dev @averjs/renderer

npm install @averjs/core
npm install -D @averjs/renderer
```

### Setup

To get you started as fast as possible with a new project, there is a executable, which lets you set this up with ease.  

Jump into your working directory and execute tohe follwing command.
```bash
node_modules/.bin/aver --init
```

When the executable is done setting up the new Project, you can start the app by executing `yarn run dev` or `npm run dev`.

### Folder structure

There are 2 main root folders, `api` and `src`. All your Vue.js code belongs inside the `src` and all the server side code belongs in the `api` folder. When you setup the project by running the `aver --init` command, you will see how the `api` and `src` folders should be strucuted. If you stick to the same structure, you are able to use the provided modules aliases which are listed in the folder structure below.

#### api folder
```
api
└───database (@database)
│   └───seeds
└───errors (@errors)
└───mail (@mail)
│   └───templates
└───middlewares (@middlewares)
└───models (@models)
└───queues (@queues)
└───routes (@routes)
```

#### src folder
```
src (@)
└───components (@components)
└───mixins (@mixins)
└───pages (@pages)
└───vuex (@vuex)
└───resources (@resources)
```

### Vuex
TODO

### Vue router

### Server Routes
TODO

### Middlewares
TODO

### Configuration

By creating a aver-config.js file inside your root directory, you can configure Aver.js or provide plugins. You can find all parameters listed below.

#### Core Paramters
|Parameter|Type|Default|Description|
|---|---|---|---|
|progressbar|Boolean\|Object|false|The `vue-progressbar` is used to prive a progressbar on page loading or switching. For configuration options see [here](https://github.com/hilongjw/vue-progressbar#constructor-options)|

#### Webpack Paramters
|Parameter|Type|Default|Description|
|---|---|---|---|
|||||

### Plugins

This is a list of all the plugins currently available:

|Plugin|Link|Description|
|---|---|---|
|@averjs/renderer|[https://www.npmjs.com/package/@averjs/renderer](https://www.npmjs.com/package/@averjs/renderer)|This package holds everything you need to render your server and client code.|
|@averjs/mailer|[https://www.npmjs.com/package/@averjs/mailer](https://www.npmjs.com/package/@averjs/mailer)|This package holds nodemailer and email-templates for your mailing purposes.|
|@averjs/mongodb|[https://www.npmjs.com/package/@averjs/mongodb](https://www.npmjs.com/package/@averjs/mongodb)|TODO|
|@averjs/queue|[https://www.npmjs.com/package/@averjs/queue](https://www.npmjs.com/package/@averjs/queue)|TODO|
|@averjs/session|[https://www.npmjs.com/package/@averjs/session](https://www.npmjs.com/package/@averjs/session)|TODO|
|@averjs/vuex-decorators|[https://www.npmjs.com/package/@averjs/vuex-decorators](https://www.npmjs.com/package/@averjs/vuex-decorators)|TODO|
|@averjs/websocket|[https://www.npmjs.com/package/@averjs/websocket](https://www.npmjs.com/package/@averjs/websocket)|TODO|


### TODO

- [ ] Add jest
- [ ] Add tests
- [ ] Add modern mode
- [ ] Add more css preprocessors
- [ ] Use `joi` in config package (https://github.com/hapijs/joi)
- [x] Add eslint
- [x] Use `lodash/template` to pass configuration to vue app