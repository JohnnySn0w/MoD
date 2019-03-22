const commando = require('discord.js-commando');
const db = require('../../../dbhandler');

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
        // get the room object that the player is in
        db.getItem(message.channel.id, 'rooms', (data) => this.getRoom(message, data, direction, true));
    }

    getRoom(message, data, direction, firstRetrieval) {
        // grab the actual room object
        var body = JSON.parse(data.body);
        var room = body.Item;

        if (firstRetrieval) {
            // if we're grabbing the room that the player is currently in, then we need to make sure it's a MUD sanctioned room
            if (room === undefined) {
                // if they're not in a MUD room, alert them of this
                message.reply("You're not inside of the MUD-related rooms.");                
            }
            else {
                // otherwise, clean up the direction passed, and move the player into the next room
                direction = this.cleanArgs(direction);
                this.movePlayer(message, direction, room);
            }
        }
        else {
            // if we're grabbing the room that the player is moving to, assign the player the new room's role ID
            message.reply("moved to \<#" + room.id + ">");
            message.member.setRoles([message.guild.roles.get(room.roleid)]).catch(console.error);
        }
    }

    cleanArgs(direction) {
        // ignore the argument's capitalization
        direction = direction.toLowerCase();
        return direction;
    }

    movePlayer(message, direction, room) {
        if (direction in room.exits) {
            // if a room exists in the given direction, use that direction's associated room ID to get the next room
            db.getItem(room.exits[direction], 'rooms', (data) => this.getRoom(message, data, direction, false));
        }
        else {
            // otherwise, alert the player of the lack of exits
            message.reply("There are no exits in the " + direction + " direction");
        }
    }
}

module.exports = MoveCommand;