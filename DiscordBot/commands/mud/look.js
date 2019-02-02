const commando = require('discord.js-commando');
const rooms = require('../../rooms.js');

const ROOM = 0;
const DEFAULT = -1;

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
        var object = this.tokenizeArguments(args);
        var room = this.determineRoom(message.channel.name);
        
        this.replyToPlayer(message, object, room);
    }

    // sanitize the arguments passed for the object
    cleanArguments(args) {
        args.object = args.object.toLowerCase();
        return args;
    }

    // determine what object the player is looking at
    tokenizeArguments(args) {
        if (args.object === "room" || args.object === "here") {
            return ROOM;
        }
        else {
            return DEFAULT;
        }
    }

    // determine what room the player is in
    determineRoom(searchName) {
        var roomObject;
        var i;
        for (i = 0; i < rooms.length; i++) {
            var roomName = rooms[i].name;

            if (searchName === roomName) {
                roomObject = rooms[i];
                break;
            }
        }

        return roomObject;
    }

    // respond to the player based on their current room and the object's description
    replyToPlayer(message, object, room) {
        if (!(room === undefined)) {
            console.log("Room Name - " + room.name);

            switch(object) {
                case ROOM:
                    message.reply(room.description);
                    break;
                default:
                    message.reply("I'm not sure what you're trying to look at.");
                    break;
            }
        }
        else {
            message.reply("You are not in a MUD-related room");
        }
    }
}

module.exports = LookCommand;