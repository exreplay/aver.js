# aver.js
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

Before you can start with the setup of a new project, be sure you create a `.npmrc` file with your authentication token.
```bash
@averjs:registry=https://npm.ppm-vi.de/
//npm.ppm-vi.de/:_authToken=
```
This has to be done so `npm` or `yarn` knows where to download the Aver.js packages and how to authenticate.

To get you started as fast as possible with a new project, there is a executable, which lets you set this up with ease.  

Jump into your working directory and execute tohe follwing command.
```bash
node_modules/.bin/aver --init
```

When the executable is done setting up the new Project, you can start the app by executing `yarn run dev` or `npm run dev`.

### Docker

Getting you started with Docker is really easy. Create a `docker-compose.yml` file inside your new and empty project folder. Copy the code from the following [docker-compose](https://gitlab.ppm-vi.de/nodejs/vue-ssr/blob/master/lib/app/docker-compose.example.yml) file and start it with `docker-compose up -d`. Dont forget to change the `GIT_USERNAME` and `GIT_PASSWORD` variables, so you are able to download the packages from Gitlab.  
The installation of the two packages and the setup are all executed automatically for you.

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
|@averjs/renderer|[https://npm.ppm-vi.de/#/detail/@averjs/renderer](https://npm.ppm-vi.de/#/detail/@averjs/renderer)|This package holds everything you need to render your server and client code.|
|@averjs/mailer|[https://npm.ppm-vi.de/#/detail/@averjs/mailer](https://npm.ppm-vi.de/#/detail/@averjs/mailer)|This package holds nodemailer and email-templates for your mailing purposes.|
|@averjs/mongodb|[https://npm.ppm-vi.de/#/detail/@averjs/mongodb](https://npm.ppm-vi.de/#/detail/@averjs/mongodb)|TODO|
|@averjs/queue|[https://npm.ppm-vi.de/#/detail/@averjs/queue](https://npm.ppm-vi.de/#/detail/@averjs/queue)|TODO|
|@averjs/session|[https://npm.ppm-vi.de/#/detail/@averjs/session](https://npm.ppm-vi.de/#/detail/@averjs/session)|TODO|
|@averjs/vuex-decorators|[https://npm.ppm-vi.de/#/detail/@averjs/vuex-decorators](https://npm.ppm-vi.de/#/detail/@averjs/vuex-decorators)|TODO|
|@averjs/websocket|[https://npm.ppm-vi.de/#/detail/@averjs/websocket](https://npm.ppm-vi.de/#/detail/@averjs/websocket)|TODO|