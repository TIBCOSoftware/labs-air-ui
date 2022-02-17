#!/bin/bash

# shellcheck disable=SC1091
. scripts/tools.sh

image_name=${1:?}
image_tag=${2:?}
image_url=${3:?}
docker_file=${4:?}
target_name=${5}

readonly local_image_tag="local_image_tag"

build_image "${image_name}" "${local_image_tag}" "${image_url}" "${docker_file}" "${target_name}"

tag_image "${image_name}" "${local_image_tag}" "${image_name}" "${image_tag}" "${image_url}"