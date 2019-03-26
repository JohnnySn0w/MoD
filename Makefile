SHELL = /bin/bash
USER = vagrant
SLS = /vagrant/node_modules/serverless/bin/serverless
DIRECTORY = ~/.config
SERVERDIR = /vagrant/dbData

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
	sudo yarn global add jest;
	sudo yarn install --no-bin-links;

.PHONY: dynamoSetup
dynamoSetup:
	sudo $(SLS) dynamodb install;
	if test -d $(SERVERDIR); \
		then sudo $(SLS) dynamodb start --migrate --seed; \
	else \
		mkdir $(SERVERDIR); \
		sudo $(SLS) dynamodb start --migrate --seed; \
	fi


.PHONY: startBot
startBot:
	sudo $(SLS) dynamodb start;
	yarn start;
	
