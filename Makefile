SHELL := /bin/bash
SCRIPTS_PATH      := scripts
DIST_PATH         := dist

ifndef IMAGE_NAME
override IMAGE_NAME = labs-air-ui-oss
endif
ifndef IMAGE_TAG
override IMAGE_TAG = latest
endif
ifndef ECR_REGISTRY
override ECR_REGISTRY = public.ecr.aws
endif
ifndef ECR_REPO_NAME
override ECR_REPO_NAME = tibcolabs
endif
ifndef IMAGE_URL
override IMAGE_URL = "$(ECR_REGISTRY)/$(ECR_REPO_NAME)"
endif

.PHONY: build-push-delete-air-ui
build-push-delete-air-ui: build-air-ui push-image delete-local-image

.PHONY: build-air-ui
build-air-ui: build-air-ui-cloud build-air-ui-on-prem

build-air-ui-cloud: build-apps
	@$(SCRIPTS_PATH)/build_air_ui.sh ${IMAGE_NAME} ${IMAGE_TAG} ${IMAGE_URL} Dockerfile

build-air-ui-on-prem: build-apps
	@$(SCRIPTS_PATH)/build_air_ui.sh ${IMAGE_NAME} ${IMAGE_TAG} ${IMAGE_URL} Dockerfile-on-prem

.PHONY: build-apps
build-apps:
	if [ ! -d "node_modules" ]; then npm ci; fi
	if [ ! -d "$(DIST_PATH)/common" ]; then ng build common; fi
	if [ ! -d "$(DIST_PATH)/cloud" ]; then ng build cloud; fi
	if [ ! -d "$(DIST_PATH)/on-prem" ]; then ng build on-prem; fi

.PHONY: push-image
push-image:
	@$(SCRIPTS_PATH)/push_image.sh ${IMAGE_NAME} ${IMAGE_TAG} ${IMAGE_URL}

.PHONY: delete-local-image
delete-local-image:
	@$(SCRIPTS_PATH)/delete_local_image.sh ${IMAGE_NAME} ${IMAGE_TAG} ${IMAGE_URL}

.PHONY: clean
clean:
	rm -rf $(DIST_PATH)