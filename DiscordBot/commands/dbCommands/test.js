const { DEBUG } = require('../../globals.js');
const commando = require('discord.js-commando');

class Test extends commando.Command {
    constructor(client) {
        super (client, {
            name: 'test',
            group: 'mud',
            memberName: 'test',
            description: 'perform regression testing on all existing commands'
        });
    }

    async run(message) {
        // delete the user's command if not debugging
        if (!DEBUG)
            message.delete();
    }
}

module.exports = Test;