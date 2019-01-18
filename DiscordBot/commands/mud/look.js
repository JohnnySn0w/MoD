const commando = require('discord.js-commando');

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
        if (message.channel.name == 'test-zone') {
            message.reply("It's an absolute warzone out here. Completely lawless and no rooms in sight.");
        }
        else {
            message.reply("That thing you're trying to look at? Yeah, I'm not sure it exists.");
        }
        // message.channel.send("I'm sorry. I don't have any legs yet.");
    }
}

module.exports = LookCommand;