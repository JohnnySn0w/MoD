const { DEBUG } = require('../../globals.js');
const commando = require('discord.js-commando');

const db = require('../../../dbhandler.js');

const look = require('../mud/look.js');
const move = require('../mud/move.js');
const start = require('../mud/start');
const stats = require('../mud/stats.js');
const talk = require('../mud/talk.js');

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
        this.testStartCommand(message);

        // delete the user's command if not debugging
        if (!DEBUG)
            message.delete();
    }

    testStartCommand(message) {
        start.run(message, "");
        db.deleteItem(message.member.id, 'players', (data) => this.testStartCommand2(message, data));
    }

    testStartCommand2(message, data) {

    }
}

module.exports = Test;