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
            case "everything":
                this.testEverything(message);
                break;
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

    testEverything(message) {
        // literally just run through every test case with 4 seconds between each run
        this.testLookCommand(message);

        setTimeout(function() {
            this.testMoveCommand(message);

            setTimeout(function() {
                this.testStartCommand(message);
                
                setTimeout(function() {
                    this.testStatsCommand(message);
                    
                    setTimeout(function() {
                        this.testTalkCommand(message);
                        
                    }, 4000);
                }, 4000);
            }, 4000);
        }, 4000);
    }

    testLookCommand(message) {
        // grab the look command and run it with an invalid item
        var command = new look(this.client);
        command.run(message, {object: "nothing"});

        // run the command again with the room
        setTimeout(function() {
            command.run(message, {object: "room"});

            // again with an item
            setTimeout(function() {
                command.run(message, {object: "pillars"});

                // again with an entity
                setTimeout(function() {
                    command.run(message, {object: "old-man"});

                    // again after deleting the player
                    setTimeout(function() {
                        db.deleteItem(message.member.id, 'players', (data) => deleteData(data));

                        setTimeout(function() {
                            command.run(message, {object: "nothing"});

                            // add the player back
                            setTimeout(function() {
                                addPlayerBack(message);
                            }, 500);
                        }, 500);
                    }, 500);
                }, 500);
            }, 500);
        }, 500);
    }

    testMoveCommand(message) {
        // grab the move command and run it with an invalid direction
        var command = new move(this.client);
        command.run(message, {direction: "nowhere"});

        // run the command again in an actual direction
        setTimeout(function() {
            command.run(message, {direction: "north"});

            // delete the player and run the command once more.
            setTimeout(function() {
                db.deleteItem(message.member.id, 'players', (data) => deleteData(data));

                setTimeout(function() {
                    command.run(message, {direction: "north"});
                    
                    // add the player back
                    setTimeout(function() {
                        addPlayerBack(message);
                    }, 500);
                }, 500);
            }, 500);
        }, 500);
    }

    testStartCommand(message) {
        // grab the start command and run it
        var command = new start(this.client);
        command.run(message);

        // delete the player and then run the start command again
        setTimeout(function() {
            db.deleteItem(message.member.id, 'players', (data) => deleteData(data));

            setTimeout(function() {
                command.run(message);

                // add the player back
                setTimeout(function() {
                    addPlayerBack(message);
                }, 500);
            }, 500);
        }, 500);
    }

    testStatsCommand(message) {
        // grab the stats command and run it
        var command = new stats(this.client);
        command.run(message);

        // delete the player and then run the stats command again
        setTimeout(function() {
            db.deleteItem(message.member.id, 'players', (data) => deleteData(data));

            setTimeout(function() {
                command.run(message);

                // add the player back
                setTimeout(function() {
                    addPlayerBack(message);
                }, 500);
            }, 500);
        }, 500);
    }

    testTalkCommand(message) {
        // grab the talk command and run it
        var command = new talk(this.client);
        command.run(message, {person: "nobody"});
    }
}

function addPlayerBack(message) {
    var newPlayer = {
        'name': message.member.user.username,
        'id': message.member.id,
        'health': 100,
        'level': 1,
        'strength': 7,
        'defense': 5,
        'inventory': [],
        'progress': {'npc':{}} // progress is added dynamically with each new npc encounter now :^)
    }

    db.saveItem(newPlayer, 'players', (data) => addData(message));
}

function deleteData(data) {
    console.log("Data deleted");
}

function addData(data) {
    console.log("Player re-added");
}

module.exports = Test;