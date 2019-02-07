const commando = require('discord.js-commando');
// todo replace rooms with dynamo
const rooms = require('../../rooms.js');

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
        args = this.cleanArguments(args);
        var room = this.determineRoom(message.channel.name);
        var person = this.determineNPC(args.person, room);
        
        this.replyToPlayer(message, person, room);
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
        for (i = 0; i < room.npcs.length; i++) {
            var npcName = room.npcs[i].name;

            if (searchName === npcName) {
                npcObject = room.npcs[i];
                break;
            }
        }

        return npcObject;
    }

    // respond to the player based on their current room and the npc's response
    replyToPlayer(message, person, room) {
        if (!(room === undefined)) {
            if (!(person === undefined)) {
                message.reply(person.formattedName + ": " + person.greeting);
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