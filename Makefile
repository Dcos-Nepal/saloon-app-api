.PHONY: help docker-tag docker-build docker-login docker-push clean show-env tools lambda-update deploy
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
# Base image for kubernetes deployment
IMAGE_NAME ?= tools:latest

# Alias command for docker's `make` executable
DOCKER_RUN ?=  \
		docker run \
		--rm \
		-w /app \
		-v $(APP_ROOT)/tools:/app \
		--entrypoint bash \
		--env AWS_ACCESS_KEY_ID=$(AWS_ACCESS_KEY_ID) \
		--env AWS_SECRET_ACCESS_KEY=$(AWS_SECRET_ACCESS_KEY) \
		$(IMAGE_NAME) \



tools:
	@docker build $(DOCKER_BUILD_FLAGS) -t tools -f $(APP_ROOT)/tools/Dockerfile $(APP_ROOT)/tools

lambda-update:
	@$(DOCKER_RUN) ./deploy.sh $(LAMBDA_FUNCTION_NAME) $(TARGET_IMAGE_LATEST) $(AWS_REGION)


docker-build: ## build docker file
	@docker build $(DOCKER_BUILD_FLAGS) --target artifact --platform=linux/amd64 -t $(SOURCE_IMAGE) -f $(DOCKER_FILE) $(DOCKER_BUILD_PATH)

docker-tag: ## docker tag
	@docker tag $(SOURCE_IMAGE) $(TARGET_IMAGE_LATEST)

docker-push: ## docker push
	@docker push $(TARGET_IMAGE_LATEST)

docker-login: ## Login to ECR registry
	aws ecr get-login-password --region $(AWS_REGION) --profile $(AWS_PROFILE) | docker login --username AWS --password-stdin $(REGISTRY_URL)

deploy: docker-build docker-tag docker-push lambda-update

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
