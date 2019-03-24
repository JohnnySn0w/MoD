const commando = require('discord.js-commando');
const db = require('../../../dbhandler');

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

    async run(message, args) {
        // get the room object that the player is in
        db.getItem(message.channel.id, 'rooms', (data) => this.getRoom(message, data, args));
    }

    getRoom(message, data, args) {
        // grab the actual room object
        var body = JSON.parse(data.body);
        var room = body.Item;

        args = this.cleanArgs(args);

        var object;
        if (args.object === "room" || args.object === "here") {
			this.replyToPlayer(message, "room", room);
        }
        else {
            // otherwise, the player is looking at an item, which we need to determine
            object = this.determineItem(args.object, room);
			if (object === undefined) { // whups lookin at a dang PERSON!!!!!!
				object = this.determineNPC(args.object, room);
				db.getItem(object, 'entities', (data) => this.replyToPlayer(message, "not room", room, data));
			} else {
				db.getItem(object, 'items', (data) => this.replyToPlayer(message, "not room", room, data));
			}
        }
    }

    cleanArgs(args) {
        // ignore the argument's capitalization
        args.object = args.object.toLowerCase();
        return args;
    }

    determineItem(searchName, room) {
        // determine what item the player is looking at in the given room
        var itemObject;
        var searchID;
        var i;

        // check if the item is in the room
        if (searchName in room.items) {
            itemObject = room.items[searchName];
        }

        return itemObject;
	}
        
	// it's not an item, check if it's an npc
	determineNPC(searchName, room) {
		var npcObject;
		if (searchName in room.npcs) {
			npcObject = room.npcs[searchName];
		}
		
		return npcObject;
    }

    replyToPlayer(message, type, room, data) {
        // respond to the player based on their current room and the object's description
		var object;
		if (type === "room") {
			object = room;
		} else {
			var body = JSON.parse(data.body);
			var item = body.Item;

			object = item;
		}
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