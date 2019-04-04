const { DEBUG } = require('../../globals.js');
const commando = require('discord.js-commando');

const db = require('../../../dbhandler.js');

const look = require('../mud/look.js');
const move = require('../mud/move.js');
const start = require('../mud/start.js');
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
            args: [
                {
                    key: 'command',
                    prompt: 'Which command do you want to test?',
                    type: 'string'
                }
            ]
        });
    }

    async run(message, {command}) {
        command = this.cleanArgs(command);

        switch(command) {
            case "look":
                this.testLookCommand(message);
                break;
            case "move":
                this.testMoveCommand(message);
                break;
            case "start":
                this.testStartCommand(message);
                break;
            case "stats":
                this.testStatsCommand(message);
                break;
            case "talk":
                this.testTalkCommand(message);
                break;
            default:
                if (!DEBUG)
                    message.delete();
        }
    }

    cleanArgs(command) {
        // ignore the argument's capitalization
        command = command.toLowerCase();
        return command;
    }

    testLookCommand(message) {

    }

    testMoveCommand(message) {

    }

    testStartCommand(message) {
        var command = new start(this.client);
        command.run(message, "");
        // db.deleteItem(message.member.id, 'players', (data) => this.testStartCommand2(message, data));
    }

    testStatsCommand(message) {

    }

    testTalkCommand(message) {

    }
}

module.exports = Test;