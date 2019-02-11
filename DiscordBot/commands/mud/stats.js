const commando = require('discord.js-commando');
var players = require('../../player-stats');

class StatsCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'stats',
            group: 'mud',
            memberName: 'stats',
            description: 'Shows player stats for the player who calls for them'      
        });
    }

    async run(message, args) {
        var play_id = message.member.id; 
        console.log(players.length);

        // checks through our players of players to see what to do next
        for (var i = 0; i < players.length; i++)
        {
            // this places a new player into our players
            if (play_id == players[i].play_id)
            {
                message.reply("Health: " + players[i].health);
                message.reply("Level: " + players[i].level);
                message.reply("Strength: " + players[i].strength);
                message.reply("Defense: " + players[i].defense);                
            }
        
            // warning if your health is low
            if (players[i].health > 0 && players[i].health < 11) {
                message.reply("You're actually about to die, my dude.");
            }
            // resets health if you "die"
            if (players[i].health <= 0) {
                players[i].health = 100;
                message.reply("Dead. Resetting health. Now back at 100.");
            }
        }
            
        }
        
    }
    

module.exports = StatsCommand;
