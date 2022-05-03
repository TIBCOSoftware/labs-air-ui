#!/bin/bash

function build_image(){
    local build_image_name=${1:?}
    local build_image_tag=${2:?}
    # local build_image_url=${3:?}
    local build_docker_file=${4:?}
    local build_target_name=${5} # Optional
    echo "Building image ${build_image_name}:${build_image_tag}..."
    if [ -z "${build_target_name}" ]; then
        docker build --no-cache -t "${build_image_name}:${build_image_tag}" -f "${build_docker_file}" . || exit 1
    else
        docker build --target "${build_target_name}" --no-cache -t "${build_image_name}:${build_image_tag}" -f "${build_docker_file}" . || exit 1
    fi
}


function tag_image(){
    local tag_local_image_name=${1:?}
    local tag_local_image_tag=${2:?}
    local tag_new_image_name=${3:?}
    local tag_new_image_tag=${4:?}
    local tag_new_image_url=${5:?}
    for i in ${tag_new_image_tag//,/$IFS}
    do
        echo "Tagging image ${tag_local_image_name}:${tag_local_image_tag} to ${tag_new_image_url}/${tag_new_image_name}:${i}"
        docker tag "${tag_local_image_name}:${tag_local_image_tag}" "${tag_new_image_url}/${tag_new_image_name}:${i}" || exit 1
    done
}

function push_image(){
    local push_image_name=${1:?}
    local push_image_tag=${2:?}
    local push_image_url=${3:?}

    for i in ${push_image_tag//,/$IFS}
    do
        echo "Pushing image ${push_image_url}/${push_image_name}:${i}..."
        docker push "${push_image_url}/${push_image_name}:${i}" || exit 1
        echo "Pushing image finished ..."
    done
}


function delete_local_image(){
    local delete_image_name=${1:?}

    echo "Deleting image ..."
    docker images -a | grep "${delete_image_name}" | awk '{print $3}' | xargs docker rmi -f || exit 1
    docker rmi -f "$(docker images -f "dangling=true" -q)"
    echo "Deleting image finished ..."
}

# check error code if error then exit
function checkError {
  if [ "${1}" -ne 0 ]; then
    echo "### ${2} See output above. Exit code: ${1}"
    printStack
    exit "${1}"
  fi
  return 0
}

# Prints a stack trace with optional message ($1)
# shellcheck disable=SC2120
function printStack () {
    echo "${1:-Stack trace}"

    local depth
          depth=${#FUNCNAME[@]}

    for ((i=1; i<depth; i++)); do
        local function="${FUNCNAME[$i]}"
        local line="${BASH_LINENO[$((i-1))]}"
        local file="${BASH_SOURCE[$((i-1))]}"
        echo " $function(), $file, line $line"
    done
}