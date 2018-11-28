FROM registry.ppm-vi.de/docker/nodejs:latest as buildstep
COPY ./ /usr/src/tmp
WORKDIR /usr/src/tmp
ARG GIT_USERNAME
ENV GIT_USERNAME ${GIT_USERNAME}
ARG GIT_PASSWORD
ENV GIT_PASSWORD ${GIT_PASSWORD}
RUN ESCAPED_USERNAME=$( /usr/local/bin/urlencode.sh "${GIT_USERNAME}" ) && \
    ESCAPED_PASSWORD=$( /usr/local/bin/urlencode.sh "${GIT_PASSWORD}" ) && \
    echo "https://${ESCAPED_USERNAME}:${ESCAPED_PASSWORD}@gitlab.ppm-vi.de" > ~/.git-credentials && \
    git config --global credential.helper store && \
    \
    yarn global add rimraf modclean && \
    yarn install && \
    yarn run build && \
    \
    rm -Rf node_modules && \
    yarn install --production && \
    modclean -r -p /usr/src/tmp && \
    rm -Rf ~/.git-credentials \
            .git .idea src \
            docker-compose.example.yml docker-compose.yml Dockerfile \
            .gitlab-ci.yml .babelrc .dockerignore .eslintignore .eslintrc.js .gitignore .gitlab-ci.yml .modernizrrc package.json yarn.lock && \
    touch .env

FROM mhart/alpine-node:base-8
COPY --from=buildstep /usr/src/tmp /usr/src/app
ENV PORT=1337
EXPOSE $PORT
WORKDIR /usr/src/app
ENTRYPOINT ["node", "./index.js"]