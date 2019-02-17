const commando = require('discord.js-commando');
const db = require('../../../dbhandler');
var players = require('../../player-stats'); // place to hold our stats for all players (will replace with database soon)

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
        message.delete();
        entryRoomRole = message.guild.roles.find(role => role.name === "entry-room");

        // moved the initialization of player stats from stats to start - Santiago

        var player = message.member.user.username; // gets player name
        var play_id = message.member.id; // gets player id
        var health = 100; // starting health value for all
        var level = 1;
        var strength = 7;
        var defense = 5; 
        var inventory = [];
        var progress = [];

        if (message.channel.name == 'landing-zone') {
            // check to make sure player doesn't exist yet via player id
            var check = false;
            for (var i = 0; i < players.length; i++)
            {
                if (play_id == players[i].play_id)
                {
                    check = true;    
                    break;                                         
                }
                
            }

            // if not there, push the player stats
            if (check) {
                message.reply("it seems like you've already started!");
            } 
            else {              
                players.push({player, play_id, health, level, strength, defense, inventory, progress}); 
                //console.log(db.saveItem({player, play_id, health, level, strength, defense, inventory, progress}));
                message.reply("Welcome to the MUD! Your journey starts in the above text channels. Good luck!");
                message.member.setRoles([entryRoomRole]).catch(console.error);
                console.log(players);
            }
        }
        else {
            message.reply("Sorry, you can't start playing the MUD unless you're in the <#525378260192854027>.");
        }
    }
}

module.exports = StartCommand;