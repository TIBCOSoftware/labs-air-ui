#!/usr/bin/env bash

# shellcheck disable=SC1091
. ./scripts/tools.sh

# This script may be used to setup a local environment with a dGraph backend
# that includes the schema and runs the dev version of the service in order
# to facilitate local development with an integrated server.
dGraphContainerName=dGraphIntTest
dGraphRatelContainerName=dGraphRatel
dGraphPort=8080
dGraphRatelPort=8000

function cleanup {
  echo Stopping the docker containers...
  docker stop -t0 ${dGraphRatelContainerName} ${dGraphContainerName}

  kill 0
}

trap cleanup EXIT

service_url=https://localhost:4200/

docker pull dgraph/standalone:v21.12.0
docker run --name ${dGraphContainerName} --rm -d -p "${dGraphPort}:8080" -p "9080:9080" "dgraph/standalone:v21.12.0"
docker run --rm --name ${dGraphRatelContainerName} -d -p ${dGraphRatelPort}:8000 dgraph/ratel

npm run start &

WAITING=1
while [ ${WAITING} != "0" ]
do
  sleep 2
  curl -s ${service_url} --insecure  && WAITING="0"
done

echo
echo
echo The dGraph service is running on http://localhost:${dGraphPort}
echo The ratel web interface is operating on http://localhost:${dGraphRatelPort}
echo

# Apply the schema to dGraph
if [ -e "../labs-air-charts/charts/dgraph-loader/datainit/schema_data.rdf" ]; then
  curl -X POST http://localhost:${dGraphPort}/alter --data-binary '@../labs-air-charts/charts/dgraph-loader/datainit/schema_data.rdf' | jq
  checkError ${?} "The schema did not apply successfully..."

  echo
  echo The schema has been applied.

  ts=$(date +%s)
  curl -X POST -H "Content-Type: application/rdf" http://localhost:${dGraphPort}/mutate?commitNow=true -d $"
  {
      set {
        _:Gateway <dgraph.type> \"Gateway\" .
        _:Gateway <gateway> \"\" .
        _:Gateway <type> \"gateway\" .
        _:Gateway <account> \"\" .
        _:Gateway <uuid> \"My Gateway\" .
        _:Gateway <description> \"My Gateway for Testing\" .
        _:Gateway <address> \"localhost\" .
        _:Gateway <router> \"localhost\" .
        _:Gateway <routerPort> \"9000\" .
        _:Gateway <deployNetwork> \"\" .
        _:Gateway <latitude> \"0\" .
        _:Gateway <longitude> \"0\" .
        _:Gateway <accessToken> \"keepMeSecret\" .
        _:Gateway <username> \"myUser\" .
        _:Gateway <platform> \"Linux\" .
        _:Gateway <createdts> \"${ts}000\" .
        _:Gateway <updatedts> \"${ts}000\" .
      }
    }" | jq '.data| .code'
else
   echo "If the labs-air-charts repository is available in $(pwd)/.., the dGraph schema may be applied on startup."
fi


# Resumes the Angular dev server process and waits for control-c
wait "$(jobs -p)"