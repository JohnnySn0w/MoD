const commando = require('discord.js-commando');
const db = require('../../../dbhandler');
const entities = require('../../schemas/entities');

class StartCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'start',
            group: 'mud',
            memberName: 'start',
            description: 'sets the player on his or her journey into the MUD'
        });
    }

    async run(message, args) {
        if (message.channel.name == 'test-zone') {
            // if the user is in the correct chat, attempt to grab their player data from the server
            db.getItem(message.member.id, 'players', (data) => this.getPlayer(message, data));
        }
        else {
            // otherwise, direct the user to where they can start the game at
            message.reply("Sorry, you can't start playing the MUD unless you're in the <#525378260192854027>.");
        }

        // delete the user's command if not debugging
        if (!DEBUG)
            message.delete();
    }

    getPlayer(message, data) {
        // grab the actual player object
        var body = JSON.parse(data.body);
        var player = body.Item;

        if (player === undefined) {
            // if the player doesn't exist in the database, create a new player object to push to the db
            var newPlayer = {
                'name': message.member.user.username,
                'id': message.member.id,
                'health': 100,
                'level': 1,
                'strength': 7,
                'defense': 5,
                'inventory': [],
                'progress': this.createProgress()
            }

            db.saveItem(newPlayer, 'players', (data) => this.setRoles(message));
        }
        else {
            // otherwise, the player is already a part of the database
            message.reply("it seems like you've already started!");
        }
    }

    createProgress() {
        // this method creates all of the variables needed for the player to interact properly with all of the NPCs in the game
        var progress = {};
        var npc = {};

        for (var i = 0; i < entities.length; i++) {
            npc[entities[i].id] = "0";
        }

        progress.npc = npc;

        return progress;
    }

    setRoles(message) {
        // once the player data is stored on the database, reassign the player's room permissions to the entry room
        var entryRoomRole = message.guild.roles.find(role => role.name === "entry-room");
        message.reply("Welcome to the MUD! Your journey starts in the above text channels. Good luck!");
        message.member.setRoles([entryRoomRole]).catch(console.error);
    }
}

module.exports = StartCommand;