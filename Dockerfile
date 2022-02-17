FROM nginx:1.21.6-alpine

COPY ./dist/cloud/ /usr/share/nginx/html
