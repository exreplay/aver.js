# Vue Server Side Rendering

This plugin has everything you need to start a new Vue project which is capable of server side rendering.  

## Installation

To start a new project, you have to install two packages. The `vue-ssr` holds the core with express and all the other stuff which is necessary for server side rendering. And than there is `vue-ssr-renderer` for all the webpack stuff. The 2 packages are seperated so you are able to have the rendering stuff in the `devDependencies` and therefore it is not getting installed in production. 

To install both, execute the following commands inside a new and empty directory.
```bash
yarn add https://gitlab.ppm-vi.de/nodejs/vue-ssr.git
yarn add --dev https://gitlab.ppm-vi.de/nodejs/vue-ssr-renderer.git
```

## Setup

To get you started as fast as possible with a new project, there is a executable, which lets you set up this with ease.  

Jump into your working directory and execute the following command.
```bash
node_modules/.bin/vue-ssr-init
```

When the executable is done setting up the new Project, you can either start a container with the provided `docker-compose.yml` file or you can just execute `node ./index.js`.  

## TODO
- Explain vue-ssr-config.js