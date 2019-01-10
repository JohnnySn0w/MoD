const commando = require('discord.js-commando');

class LookCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'look',
            group: 'mud',
            memberName: 'look',
            description: 'Gives a description of an item in the same room as the user'
        });
    }

    async run(message, args) {
        if (message.channel.name == 'test-zone') {
            message.reply("It's an absolute warzone out here. Completely lawless and no rooms in sight.");
        }
        else {
            message.reply("There's nothing to look at in here. Preeeetty empty.");
        }
        // message.channel.send("I'm sorry. I don't have any legs yet.");
    }
}

module.exports = LookCommand;