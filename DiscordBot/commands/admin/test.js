const { DEBUG } = require('../../globals.js');
const commando = require('discord.js-commando');

class Test extends commando.Command {
    constructor(client) {
        super (client, {
            name: 'test',
            group: 'admin',
            memberName: 'test',
            description: 'perform regression testing on all existing commands',
            //bot permissions
            clientPermissions: ['ADMINISTRATOR'],
            //user permissions
            userPermissions: ['ADMINISTRATOR'],
        });
    }

    async run(message) {
        // delete the user's command if not debugging
        if (!DEBUG)
            message.delete();
    }
}

module.exports = Test;