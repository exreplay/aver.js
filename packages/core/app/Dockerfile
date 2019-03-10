FROM mhart/alpine-node:10 as buildstep
COPY ./ /usr/src/tmp
WORKDIR /usr/src/tmp
RUN yarn global add rimraf modclean && \
    yarn install && \
    yarn run build && \
    \
    rm -Rf node_modules && \
    yarn install --production && \
    modclean -r -p /usr/src/tmp && \
    rm -Rf .npmrc .git .idea src wordpress \
            docker-compose.example.yml docker-compose.yml Dockerfile wp.Dockerfile \
            .gitlab-ci.yml .babelrc .dockerignore .eslintignore .eslintrc.js .gitignore .gitlab-ci.yml .modernizrrc package.json yarn.lock && \
    touch .env

FROM mhart/alpine-node:base-10
COPY --from=buildstep /usr/src/tmp /usr/src/app
ENV PORT=1337
EXPOSE $PORT
WORKDIR /usr/src/app
ENTRYPOINT ["node", "./index.js"]