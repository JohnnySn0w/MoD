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
        message.reply("I'm sorry. I don't have any legs yet.");
        // message.channel.send("I'm sorry. I don't have any legs yet.");
    }
}

module.exports = MoveCommand;