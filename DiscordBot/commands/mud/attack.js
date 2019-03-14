const commando = require('discord.js-commando');
// todo replace rooms with dynamo
/* **************************************
TODO: this is just a copy pasta from look right now. I'm working on it!!!
*************************************** */
const rooms = require('../../schemas/rooms.js');
const items = require('../../schemas/items.js');

class AttackCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'attack',
            group: 'mud',
            memberName: 'attack',
            description: 'Attacks someone in the room with the player',
            args: [
                {
                    key: 'npc',
                    prompt: 'who do you want to attack?',
                    type: 'string'
                }
            ]
        });
    }

    // this is essentially the main method of the command
	/* **************************************
	TODO: double check that this is what we need
	*************************************** */
    async run(message, args) {
        args = this.cleanArguments(args);
        var room = this.determineRoom(message.channel.name);

        var object;
        if (args.object === "room" || args.object === "here") {
            object = room;
        }
        else {
            object = this.determineItem(args.object, room);
        }
        
        this.replyToPlayer(message, object, room);
    }

    // sanitize the arguments passed for the object
    cleanArguments(args) {
        args.object = args.object.toLowerCase();
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

    // determine what the player is looking at
	/* **************************************
	TODO: we'll need to account for items and also for npcs that AREN'T hostile!!!!!!!!!
	so here we can figure out WHAT it is and then based on the response, we determine if we need to calculate the damage
	*************************************** */
    determineItem(searchName, room) {
        var itemObject;
        var searchID;
        var i;
        // check if the item is in the room
        if (searchName in room.items) {
            searchID = room.items[searchName];

            // if the item is in the room, find its object in items.js
            for (i = 0; i < items.length; i++) {
                var itemID = items[i].id;
    
                if (searchID === itemID) {
                    itemObject = items[i];
                    break;
                }
            }
        }
        // it's not an item, check if it's an npc
        else {
            for (i = 0; i < room.npcs.length; i++) {
				var npcName = room.npcs[i].name;

				if (searchName === npcName) {
					itemObject = room.npcs[i];
					break;
				}
			}
        }

        return itemObject;
    }

	/* **************************************
	TODO: we need a function to calculate damage to player and to the npc
	*************************************** */

    // respond to the player based on their current room and the object's description
	/* **************************************
	TODO: the response should say the health the enemy has and what damage you dealt
	something like??? "[player_name] traded blows with [NPC_name]! [NPC_name] took x damage! [player_name] took x damage!"
	*************************************** */
    replyToPlayer(message, object, room) {
        if (!(room === undefined)) {
            if (!(object === undefined)) {
                message.reply(object.description);
            }
            else {
                message.reply("I'm not sure what you're trying to look at.");
            }
        }
        else {
            message.reply("You are not in a MUD-related room");
        }
    }
}

module.exports = LookCommand;