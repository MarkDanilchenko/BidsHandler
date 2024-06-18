# Node version
ARG NODE_VERSION=20.11.0

# ------------------------------------------------------BACKEND

from node:${NODE_VERSION} as BACKEND

LABEL maintainer="2023 MyHomeworks, { }"

WORKDIR /app

COPY ./.env .

WORKDIR /app/api

COPY ./api/package.json .

RUN npm install

COPY ./api .