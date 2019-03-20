const commando = require('discord.js-commando');
// todo replace rooms with dynamo
const rooms = require('../../schemas/rooms.js');

class MoveCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'move',
            group: 'mud',
            memberName: 'move',
            description: 'Moves the user to a different room (i.e. text channel)',
            args: [
                {
                    key: 'direction',
                    prompt: 'which direction do you wish to move in?',
                    type: 'string'
                }
            ]
        });
    }

    // this is essentially the main method of the command
    async run(message, {direction}) {
        direction = this.cleanArguments(direction);
        var room = this.determineRoom(message.channel.name);

        // delete command after saying it!
        message.delete();

        if (!(room === undefined)) {
            this.movePlayer(message, direction, room);
        }
        else {
            message.reply("You're not inside of the MUD-related rooms.");
        }
        
        // message.channel.send("I'm sorry. I don't have any legs yet.");
        // let membersWithRole = role.members;
        // console.log(`Got ${membersWithRole.size} members with that role.`);
    }

    // sanitize the arguments passed for the object
    cleanArguments(direction) {
        direction = direction.toLowerCase();
        return direction;
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

    // move the player to the next room if it exists
    movePlayer(message, direction, room) {
        if (direction in room.exits) {
            var nextRoom = this.determineRoom(room.exits[direction]);
            message.reply("moved to \<#" + nextRoom.id + ">");
            message.member.setRoles([message.guild.roles.get(nextRoom.roleid)]).catch(console.error);
        }
        else {
            message.reply("There are no exits in the " + direction + " direction");
        }
    }
}

module.exports = MoveCommand;