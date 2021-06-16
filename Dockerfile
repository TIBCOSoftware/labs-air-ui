# Stage 1
FROM node:16-alpine3.13 as build-step

RUN apk update
RUN apk add git
RUN mkdir -p /app


WORKDIR /app

COPY package.json /app

RUN npm install --legacy-peer-deps

COPY . /app

RUN npm run build --prod

# Stage 2
FROM nginx:1.21.0-alpine

COPY --from=build-step /app/dist/ProjectAir /usr/share/nginx/html