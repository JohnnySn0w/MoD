SHELL = /bin/bash
USER = vagrant
SLS = /vagrant/node_modules/serverless/bin/serverless

.PHONY: dependencies
dependencies:
	mkdir ~/.config;
	sudo chown -R $(USER) ~/.npm; sudo chown -R $(USER) ~/.config;
	yarn;

.PHONY: setDynamo
setDynamo:
	$(SLS) dynamodb install;
	$(SLS) dynamodb start --migrate
	