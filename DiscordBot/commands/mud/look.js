const index = require('../../index.js');
const commando = require('discord.js-commando');
const items = require('../../schemas/items.js');
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

        console.log(index);
        console.log(index.DEBUG);
        // delete the user's command if not debugging
        if (!index)
            message.delete();
    }

    getRoom(message, data, args) {
        // grab the actual room object
        var body = JSON.parse(data.body);
        var room = body.Item;

        args = this.cleanArgs(args);

        var object;
        if (args.object === "room" || args.object === "here") {
            // if the player is looking at the room, then set the object as the room
            object = room;
        }
        else {
            // otherwise, the player is looking at an item, which we need to determine
            object = this.determineItem(args.object, room);
        }
        this.replyToPlayer(message, object, room);
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

    replyToPlayer(message, object, room) {
        // respond to the player based on their current room and the object's description
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