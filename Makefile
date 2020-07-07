SHELL := /bin/bash
SCRIPTS_PATH      := scripts

.PHONY: build-push-delete-air-ui
build-push-delete-air-ui: build-air-ui push-image delete-local-image

.PHONY: build-air-ui
build-air-ui:
	@$(SCRIPTS_PATH)/build_air_ui.sh ${IMAGE_NAME} ${IMAGE_TAG} ${IMAGE_URL}