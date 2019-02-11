const commando = require('discord.js-commando');
var players = require('../../player-stats'); // place to hold our stats for all players (will replace with database soon)
const fs = require('fs');

var entryRoomRole;

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
        entryRoomRole = message.guild.roles.find(role => role.name === "entry-room");

        // moved the initialization of player stats from stats to start - Santiago
        var value = args.value; // lets us use our args above
        var player = message.member; // gets player name
        var play_id = message.member.id; // gets player id
        var health = 100; // starting health value for all
        var level = 1;
        var strength = 7;
        var defense = 5;
        console.log(value);

        for (var i = 0; i < players.length; i++)
        {
            // this places a new player into our players
            if (play_id != players[i].play_id)
            {
                message.reply("you have no stats yet.");
                players[i] = {player, play_id, health, level, strength, defense};
                
                message.reply("you now have stats");                  
            }
        }

        if (message.channel.name == 'test-zone') {
            if (message.member.roles.some(r=>["entry-room", "room-0", "room-1", "room-2"].includes(r.name)) ) {
                message.reply("Well. It seems like you've already started!");
            }
            else {
                message.reply("Welcome to the MUD! Your journey starts in the above text channels. Good luck!");
                message.member.setRoles([entryRoomRole]).catch(console.error);
            }
        }
        else {
            message.reply("Sorry, you can't start playing the MUD unless you're in the <#525378260192854027>.");
        }
    }
}

module.exports = StartCommand;