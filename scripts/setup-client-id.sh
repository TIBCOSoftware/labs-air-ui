#!/bin/sh

# Expects a CLIENT_ID variable in the environment which will be used to augment the
# Angular Application with a client ID for use with authentication.

if [ -z "${CLIENT_ID}" ]  || [ "${CLIENT_ID}" = "PROVIDE_A_CLIENT_ID" ]; then
    echo "No known client identifier present in the environment. Be sure to provide one to the container!"
    exit 1
fi

sed -i'' "s/SET_ME_TO_A_VALID_CLIENT_ID/${CLIENT_ID}/" /usr/share/nginx/html//main.*.js