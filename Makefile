#!/usr/bin/env bash
.PHONY: dependencies
dependencies:
	yarn install;

#clean up docker volumes/containers
.PHONY: clean
clean:
	@docker volume list -q | xargs docker volume rm; \
	docker ps -aq | xargs docker rm -f;

#clean up docker images (last resort, involves redownload of images)
.PHONY: cleanImages
cleanImages		
	docker images -aq | xargs docker rmi -f;