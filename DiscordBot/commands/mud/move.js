const commando = require('discord.js-commando');

class MoveCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'move',
            group: 'mud',
            memberName: 'move',
            description: 'Moves the user to a different room (i.e. text channel)'
        });
    }

    async run(message, args) {
        /*
        let role = message.guild.roles.find(role => role.name === "entry-room")
        let membersWithRole = role.members;
        console.log(`Got ${membersWithRole.size} members with that role.`);

        let member = message.member;
        if (membersWithRole.size < 2) {
            member.addRole(role).catch(console.error);
        }
        else {
            member.removeRole(role).catch(console.error);
        }
        */

        message.reply("I'm sorry. I don't have any legs yet.");
        // message.channel.send("I'm sorry. I don't have any legs yet.");
    }
}

module.exports = MoveCommand;