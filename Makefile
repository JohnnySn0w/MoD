SHELL = /bin/bash
SLS = ./node_modules/serverless/bin/serverless
SERVERDIR = ./dbData
# DIRECTORY = ~/.config
# USER = vagrant

####These commands are deprecated, and only useful/safeish inside a vm
# .PHONY: deleteDir
# deleteDir:
# 	if test -d $(DIRECTORY); \
# 		then sudo rm -rf $(DIRECTORY); \
# 	fi

# .PHONY: dependencies
# dependencies: deleteDir 
# 	# mkdir $(DIRECTORY);
# 	yarn install --no-bin-links;

.PHONY: dynamoSetup
dynamoSetup:
	$(SLS) dynamodb install;
	if test -d $(SERVERDIR); \
		then $(SLS) dynamodb start --migrate --seed; \
	else \
		mkdir $(SERVERDIR); \
		$(SLS) dynamodb start --migrate --seed; \
	fi


.PHONY: startBot
startBot:
	sudo $(SLS) dynamodb start;
	yarn start;
	
