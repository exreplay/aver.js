# Vue Server Side Rendering

This plugin has everything you need to start a new Vue project which is capable of server side rendering.  

## Installation

Before you start a new project, you can decide if you want to use Docker or just run it locally. If you decide to use Docker, jump to the section [Docker](#Docker).  
The `vue-ssr` holds the core with express and all the other stuff which is necessary for server side rendering. And than there is `vue-ssr-renderer` for all the webpack stuff. The 2 packages are seperated so you are able to have the rendering stuff in the `devDependencies` and therefore it is not getting installed in production. 

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

When the executable is done setting up the new Project, you can either start a container with the provided `docker-compose.yml` file or you can just execute `yarn run dev`. 
Keep in mind that when you use the `docker-compose.yml` you will probably have to rebase sass inside the container.

## Docker

Getting you started with Docker is really easy. Create a `docker-compose.yml` file inside your new and empty project folder. Copy the code from the following [docker-compose](https://gitlab.ppm-vi.de/nodejs/vue-ssr/blob/master/lib/app/docker-compose.example.yml) file and start it with `docker-compose up -d`. Dont forget to change the `GIT_USERNAME` and `GIT_PASSWORD` variables, so you are able to download the packages from Gitlab.  
The installation of the two packages and the setup are all executed automatically for you.

## TODO
- Explain vue-ssr-config.js