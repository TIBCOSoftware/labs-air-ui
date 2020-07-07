#!/bin/bash

. scripts/tools.sh

image_name=$1
image_tag=$2
image_url=$3

push_image $image_name $image_tag $image_url