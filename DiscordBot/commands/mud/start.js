const commando = require('discord.js-commando');

var entryRoomRole;

class StartCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'start',
            group: 'mud',
            memberName: 'start',
            description: 'Sets the user on his or her journey into the MUD'
        });
    }

    async run(message, args) {
        entryRoomRole = message.guild.roles.find(role => role.name === "entry-room");

        if (message.channel.name == 'test-zone') {
            if (message.member.roles.some(r=>["entry-room", "room-0", "room-1", "room-2"].includes(r.name)) ) {
                message.reply("Well. It seems like you've already started!");
            }
            else {
                message.reply("Welcome to the MUD! Your journey starts in the above text channels. Good luck!");
                message.member.setRoles([entryRoomRole]).catch(console.error);
            }
        }
        else {
            message.reply("Sorry, you can't start playing the MUD unless you're in the <#525378260192854027>.");
        }
    }
}

module.exports = StartCommand;