SHELL = /bin/bash
USER = vagrant
SLS = /vagrant/node_modules/serverless/bin/serverless
DIRECTORY = ~/.config

.PHONY: deleteDir
deleteDir:
	if test -d $(DIRECTORY); \
		then sudo rm -rf $(DIRECTORY); \
	fi

.PHONY: dependencies
dependencies: deleteDir 
	mkdir $(DIRECTORY);
	sudo chown -R $(USER) ~/.npm; sudo chown -R $(USER) $(DIRECTORY);
	sudo yarn global add nodemon;
	sudo yarn install;

.PHONY: setDynamo
setDynamo:
	sudo $(SLS) dynamodb install;

.PHONY: startBot
startBot:
	sudo $(SLS) dynamodb start --migrate
	yarn start
	