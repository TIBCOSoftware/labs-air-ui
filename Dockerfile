FROM nginx:1.21.6-alpine

ENV CLIENT_ID=PROVIDE_A_CLIENT_ID

COPY ./dist/cloud/ /usr/share/nginx/html
COPY ./scripts/setup-client-id.sh /docker-entrypoint.d/10-setup_client_id.sh
