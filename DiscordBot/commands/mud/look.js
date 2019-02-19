const commando = require('discord.js-commando');
// todo replace rooms with dynamo
const rooms = require('../../schemas/rooms.js');
const items = require('../../schemas/items.js');

class LookCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'look',
            group: 'mud',
            memberName: 'look',
            description: 'Gives a description of an item in the same room as the user',
            args: [
                {
                    key: 'object',
                    prompt: 'what are you trying to look at?',
                    type: 'string'
                }
            ]
        });
    }

    // this is essentially the main method of the command
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

    // determine what item the player is looking at
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

    // respond to the player based on their current room and the object's description
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