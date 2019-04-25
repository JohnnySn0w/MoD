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
                this.testEverything(message, this.client);
                break;
            case "look":
                testLookCommand(message, this.client);
                break;
            case "move":
                testMoveCommand(message, this.client);
                break;
            case "start":
                testStartCommand(message, this.client);
                break;
            case "stats":
                testStatsCommand(message, this.client);
                break;
            case "talk":
                testTalkCommand(message, this.client);
                break;
            case "attack":
                testAttackCommand(message, this.client);
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

    testEverything(message, client) {
        // literally just run through every test case with 4 seconds between each run
        message.channel.send("Testing Look");
        testLookCommand(message, client);

        setTimeout(function() {
            message.channel.send("Testing Move");
            testMoveCommand(message, client);

            setTimeout(function() {
                message.channel.send("Testing Start");
                testStartCommand(message, client);
                
                setTimeout(function() {
                    message.channel.send("Testing Stats");
                    testStatsCommand(message, client);
                    
                    setTimeout(function() {
                        message.channel.send("Testing Talk");                        
                        testTalkCommand(message, client);
                        
                        setTimeout(function() {
                            message.channel.send("Testing Attack");                        
                            testAttackCommand(message, client);
                            
                        }, 4000);
                    }, 4000);
                }, 4000);
            }, 4000);
        }, 4000);
    }
}

function testLookCommand(message, client) {
    // grab the look command and run it with an invalid item
    var command = new look(client);
    command.run(message, {object: "nothing"});

    // run the command again with the room
    setTimeout(function() {
        command.run(message, {object: "room"});

        // again with an item
        setTimeout(function() {
            command.run(message, {object: "pillars"});

            // again with an NPC
            setTimeout(function() {
                command.run(message, {object: "old-man"});

                // again with an enemy
                setTimeout (function() {
                    command.run(message, {object: "goblin"});

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
    }, 500);
}

function testMoveCommand(message, client) {
    // grab the move command and run it with an invalid direction
    var command = new move(client);
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

function testStartCommand(message, client) {
    // grab the start command and run it
    var command = new start(client);
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

function testStatsCommand(message, client) {
    // grab the stats command and run it
    var command = new stats(client);
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

function testTalkCommand(message, client) {
    // grab the talk command and run it
    var command = new talk(client);
    command.run(message, {npc: "nobody"});

    // run the command again with a valid npc
    setTimeout(function() {
        command.run(message, {npc: "old-man"});

        // interrupt the previous discussion by talking to another npc
        setTimeout(function() {
            command.run(message, {npc: "little-boy"});

            // attempt to talk to an enemy
            setTimeout(function() {
                command.run(message, {npc: "goblin"});

                // delete the player and run the command again
                setTimeout(function() {
                    db.deleteItem(message.member.id, 'players', (data) => deleteData(data));

                    setTimeout(function() {
                        command.run(message, {npc: "old-man"});
                        
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

function testAttackCommand(message, client) {
    message.channel.send("No testing implemented yet.");
}

function addPlayerBack(message) {
    var newPlayer = {
        'name': message.member.user.username,
        'id': message.member.id,
        'health': 100,
        'maxhealth': 100,
        'currentLevel': 1,
        'strength': 7,
        'defense': 5,
        "experience":0,
        "nextLevelExperience":100,
        "inventory": {
            "keys": {
                "0": false
            },
            "items": {
                "5": {
                    "name": "itemName",
                    "equipped": false
                }
            },
            "gold": 50
        },
        "equipment": {
            "weapon": 0,
            "armor": 0
        },
        'progress': {'npc':{}}, // progress is added dynamically with each new npc encounter now :^)
        'busy': false
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