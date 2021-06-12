. scripts/tools.sh

image_name=$1
image_tag=$2
image_url=$3
target_name=$4

build_image $image_name "local_image_tag" $image_url "Dockerfile" $target_name

tag_image $image_name "local_image_tag" $image_name $image_tag $image_url