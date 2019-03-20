const commando = require('discord.js-commando');
// todo replace rooms, npcs, players with dynamo
const rooms = require('../../schemas/rooms.js');
const npcs = require('../../schemas/entities');
const players = require('../../schemas/players');

class TalkCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'talk',
            group: 'mud',
            memberName: 'talk',
            description: 'Allows users to interact with NPCs',
            args: [
                {
                    key: 'person',
                    prompt: 'who are you talking to?',
                    type: 'string'
                }
            ]
        });
    }

    // this is essentially the main method of the command
    async run(message, args) {
		var playerID = message.member.id;
        var player;

        // determine the player that's issuing the command
        for (var i = 0; i < players.length; i++) {
            if (playerID == players[i].id) {
                player = players[i];    
                break;                                         
            }
        }

        // if we couldn't find the player, they haven't started yet
        if (player === undefined) {
            message.reply("it seems that you're not a part of the MUD yet! \nUse \"?start\" in test-zone to get started!");
        }
        else {
            args = this.cleanArguments(args);
            var room = this.determineRoom(message.channel.name);
            var person = this.determineNPC(args.person, room);
            var response = (person === undefined) ? "" : this.determineResponse(person, player);
    
            this.replyToPlayer(player, message, person, response, room);
        }
    }

    // sanitize the arguments passed for the object
    cleanArguments(args) {
        args.person = args.person.toLowerCase();
        return args;
    }

    // determine what room the player is in
    determineRoom(searchName) {
        var roomObject;
        var i;

        // todo replace rooms with dynamo
        for (i = 0; i < rooms.length; i++) {
            var roomName = rooms[i].name;

            if (searchName === roomName) {
                roomObject = rooms[i];
                break;
            }
        }
		
        return roomObject;
    }

    // determine what item the player is looking at
    determineNPC(searchName, room) {
        var npcObject;
        var i;

		if (searchName in room.npcs) {
            var searchID = room.npcs[searchName];
            
			// find in the npc schema if the npc is in the room!!!
			for (i = 0; i < npcs.length; i++) {
				var npcID = npcs[i].id;
				if (npcID === searchID) {
					npcObject = npcs[i];
					break;
				}
			}
		}

        return npcObject;
    }

	// creates the npcs response and prompts based on players progress
	determineResponse(npc, player) {
        var response;
        
		if (!(npc === undefined)) {
			// find player's progress with this npc
            if (npc.id in player.progress.npc) { // check if talked to this npc before
                var progress = player.progress.npc[npc.id];
                if (progress in npc.responses) {
                    response = npc.responses[progress].reply;
                    for (var i = 0; i < npc.responses[progress].prompts.length; i++) {
                        response = response + "\n" + npc.responses[progress].prompts[i].prompt;
                    }
                }
            }
        }
        
		return response;
	}

	// Adjusts the players conversational progress with the npc
	makeProgress(player, person, playerResponse) { 
		var currentProgress = player.progress.npc[person.id];
		var progression = currentProgress;

		for (var i = 0; i < person.responses[currentProgress].prompts.length; i++) {			
			if (i.toString() === playerResponse) {
				progression = person.responses[currentProgress].prompts[i].progression;
				break;
			}
		}

		player.progress.npc[person.id] = progression;
	}

    // respond to the npc's response
    replyToPlayer(player, message, person, response, room) {
		var responded = false;
        var progress = player.progress.npc[person.id];
        
        if (!(room === undefined)) {
            if (!(progress === undefined)) {
                if (!(progress === undefined)) {
                    message.reply(person.name + ": " + response);

                    // responses change to using length
                    const filter = m => (m.content < person.responses[progress].prompts.length) && m.author.id === message.author.id; //only accepts responses in key and only from the person who started convo
                    const collector = message.channel.createMessageCollector(filter, {time: 15000});
    
                    collector.on('collect', m => {
                        responded = true;
                        // stops collector
                        collector.stop();
    
                        this.makeProgress(player, person, m.content);
                        var newResponse = this.determineResponse(person, player);
                        
                        this.replyToPlayer(player, message, person, newResponse, room);
                    });
    
                    collector.on('end', m => {
                        if (!responded) {
                            message.reply(person.name + " walked away...")
                        }
                    });
                }
                else {
                    message.reply("There was no response...");
                }
            }
            else {
                message.reply("I'm not sure who you're talking to...");
            }
        }
        else {
            message.reply("You are not in a MUD-related room");
        }
    }
}

module.exports = TalkCommand;