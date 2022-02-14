.PHONY: help docker-tag docker-build docker-login docker-push clean show-env
.DEFAULT_GOAL := help

define PRINT_HELP_PYSCRIPT
import re, sys

for line in sys.stdin:
	match = re.match(r'^([/a-zA-Z_-]+):.*?## (.*)$$', line)
	if match:
		target, help = match.groups()
		print("%-30s %s" % (target, help))
endef
export PRINT_HELP_PYSCRIPT

APP_ROOT ?= $(shell 'pwd')

export GIT_COMMIT ?= $(shell git rev-parse HEAD)
export GIT_BRANCH ?= $(shell git rev-parse --abbrev-ref HEAD)


export MAKEFILE_ENV_FILE ?= Makefile.override.dev
export ENVIRONMENT_OVERRIDE_PATH ?= $(APP_ROOT)/env/$(MAKEFILE_ENV_FILE)
export DOCKER_BUILD_FLAGS ?= --no-cache
export DOCKER_BUILD_PATH ?= $(APP_ROOT)
export DOCKER_FILE ?= $(APP_ROOT)/Dockerfile.lambda
export SOURCE_IMAGE ?= orange-api
export TARGET_IMAGE ?= $(REGISTRY_URL)/$(ECR_REPO_NAME)
export TARGET_IMAGE_LATEST ?= $(TARGET_IMAGE):$(SOURCE_IMAGE)-$(GIT_BRANCH)-$(GIT_COMMIT)

-include $(ENVIRONMENT_OVERRIDE_PATH)

docker-build: ## build docker file
	@docker build $(DOCKER_BUILD_FLAGS) --targe artifact --platform=linux/amd64 -t $(SOURCE_IMAGE) -f $(DOCKER_FILE) $(DOCKER_BUILD_PATH)

docker-tag: ## docker tag
	@docker tag $(SOURCE_IMAGE) $(TARGET_IMAGE_LATEST)

docker-push: ## docker push
	@docker push $(TARGET_IMAGE_LATEST)

docker-login: ## Login to ECR registry
	aws ecr get-login-password --region $(AWS_REGION) --profile recovvo | docker login --username AWS --password-stdin $(REGISTRY_URL)

clean: ## Remove log file.
	@rm -rf logs/**.log logs/**.json build
.PHONY: show-env

show-env: ## Show environment variables
	@cat $(APP_ROOT)/env/$(MAKEFILE_ENV_FILE) \
	  | grep -v '^$$' \
	  | xargs -d "\n" -I "{}" bash -c "cut -d ' ' -f 2 < <(echo '{}')" \
	  | xargs -d "\n" -I "{}" -n 1 bash -c "printf "{}="; printenv {}"

help:
	@python3 -c "$$PRINT_HELP_PYSCRIPT" < $(MAKEFILE_LIST)
