const {DEBUG} = require('../../globals.js');
const commando = require('discord.js-commando');
const db = require('../../../dbhandler');

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
                    prompt: 'Who are you talking to?',
                    type: 'string'
                }
            ]
        });
    }

    async run(message, args) {
        // get the player object so that we know the player's progress with this NPC
        db.getItem(message.member.id, 'players', (data) => this.getPlayer(message, args, data));

        // delete the user's command if not debugging
        if (!DEBUG)
            message.delete();
    }

    getPlayer(message, args, data) {
        // grab the actual player object
        var body = JSON.parse(data.body);
        var player = body.Item;

        if (player === undefined) {
            // if we couldn't find the player, they haven't started yet
            message.reply("it seems that you're not a part of the MUD yet! \nUse \"?start\" in test-zone to get started!");
        }
        else {
            // otherwise, get the room object that the player is in
            db.getItem(message.channel.id, 'rooms', (data) => this.getRoom(message, args, player, data));
		}
    }

    getRoom(message, args, player, data) {
        // grab the actual player object
        var body = JSON.parse(data.body);
        var room = body.Item;


        args = this.cleanArgs(args);

		if (room === undefined) {
			message.reply("You are not in a MUD related room");
		} else {
			// Get the NPC id and data
			var npcID = this.determineNPC(args.person, room);
			db.getItem(npcID, 'entities', (data) => this.getProgress(message, args, player, room, data));

		}
	}

	getProgress(message, args, player, room, data) {
		var body = JSON.parse(data.body);
        var person = body.Item;
        
        if (person === undefined) {
            message.reply("talks to no-one in particular...");
        }
        else {
            var response = this.determineResponse(person, player);

            this.replyToPlayer(player, message, person, response, room, false);
        }
	}

    cleanArgs(args) {
        // ignore the argument's capitalization
        args.person = args.person.toLowerCase();
        return args;
    }

    // determine what npc the player is looking at
    determineNPC(searchName, room) {
        var npcID;
        var i;

		if (searchName in room.npcs) {
            npcID = room.npcs[searchName];
		}

		return npcID;
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
            } else { 
				// haven't talked to this npc before? 
				//NBD create npc progress in the player object and get chattin :)
				player.progress.npc[npc.id] = "0";
				response = npc.responses["0"].reply;
				for (var i = 0; i < npc.responses["0"].prompts.length; i++) {
                    response = response + "\n" + npc.responses["0"].prompts[i].prompt;
                }
				db.saveItem
			}
        }
        
		return response;
	}

    // respond to the npc's response
    replyToPlayer(player, message, person, response, room, stop) {
		var responded = false;
        var progress = player.progress.npc[person.id];
        
        if (!(room === undefined)) {
            if (!(progress === undefined)) {
                if (!(progress === undefined)) {
                    message.reply(person.name + ": " + response);

					if (!stop) {
						// responses change to using length
						const filter = m => ((m.content < person.responses[progress].prompts.length) || (m.content.includes("?talk"))) && m.author.id === message.author.id; //only accepts responses in key and only from the person who started convo
						const collector = message.channel.createMessageCollector(filter, {time: 15000});
    
						collector.on('collect', m => {
							responded = true;
							// stops collector
							collector.stop();
							if (m.content.includes("?talk")) {
								var newResponse = "Oh ok bye";
								this.replyToPlayer(player, message, person, newResponse, room, true);
							} else {    
								this.makeProgress(player, person, m.content);
								var newResponse = this.determineResponse(person, player);
								this.replyToPlayer(player, message, person, newResponse, room, false);
							}
						});
    
						collector.on('end', m => {
							if (!responded) {
								message.reply(person.name + " walked away...")
							}
						});
					}
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

        // push the progression to the database
        player.progress.npc[person.id] = progression;
        db.saveItem(player, 'players', (data) => this.idk());
    }
    
    idk() {
        console.log("Idk how to handle callbacks when I don't need one");
    }
}

module.exports = TalkCommand;