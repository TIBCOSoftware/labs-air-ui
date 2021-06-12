#!/bin/bash

function build_image(){
    local build_image_name=$1
    local build_image_tag=$2
    local build_image_url=$3
    local build_docker_file=$4
    local build_target_name=$5
    echo "Building image  ${build_image_name}:${build_image_tag}..."
    if [ -z ${build_target_name} ]; then 
        docker build --no-cache -t ${build_image_name}:${build_image_tag} -f ${build_docker_file} . || exit 1
    else 
        docker build --target ${build_target_name} --no-cache -t ${build_image_name}:${build_image_tag} -f ${build_docker_file} . || exit 1
    fi
}


function tag_image(){
    local tag_local_image_name=$1
    local tag_local_image_tag=$2
    local tag_new_image_name=$3
    local tag_new_image_tag=$4
    local tag_new_image_url=$5
    echo "Inside tag_image ${tag_new_image_tag}"
    for i in $(echo $tag_new_image_tag | sed "s/,/ /g")
    do
        echo "Tagging image ${tag_local_image_name}:${tag_local_image_tag} to ${tag_new_image_url}/${tag_new_image_name}:${i}"
        docker tag ${tag_local_image_name}:${tag_local_image_tag} ${tag_new_image_url}/${tag_new_image_name}:${i} || exit 1
    done
}

function push_image(){
    local push_image_name=$1
    local push_image_tag=$2
    local push_image_url=$3
    for i in $(echo $push_image_tag | sed "s/,/ /g")
    do
        echo "Pushing image ${push_image_url}/${push_image_name}:${i}..."
        docker push ${push_image_url}/${push_image_name}:${i} || exit 1
        echo "Pushing image finished ..."
    done
}


function delete_local_image(){
    local delete_image_name=$1
    local delete_image_tag=$2
    local delete_image_url=$3
    echo "Deleting image ..."
    docker images -a | grep "${delete_image_name}" | awk '{print $3}' | xargs docker rmi -f || exit 1
    docker rmi -f $(docker images -f "dangling=true" -q)
    echo "Deleting image finished ..."
}