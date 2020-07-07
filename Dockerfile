# base image
FROM node:12.13.0

# set working directory
WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

# add app
COPY . /app

RUN npm install;