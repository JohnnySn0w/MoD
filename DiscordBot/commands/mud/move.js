const commando = require('discord.js-commando');
const rooms = require('../../rooms.js');

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

    async run(message, {direction}) {
        direction = this.cleanArguments(direction);
        var room = this.determineRoom(message.channel.name);

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

    cleanArguments(direction) {
        direction = direction.toLowerCase();
        return direction;
    }

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

    movePlayer(message, direction, room) {
        if (direction in room.exits) {
            console.log("In the " + direction + " direction, the room is " + room.exits[direction]);
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