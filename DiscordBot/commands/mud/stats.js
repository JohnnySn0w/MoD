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

        // delete stat command after saying it!
        message.delete();

        // checks through our players of players to see what to do next
        for (var i = 0; i < players.length; i++)
        {
            // this places a new player into our players
            if (play_id == players[i].play_id)
            { 
                // how to DM users anything - these two commands right here
                let user = players[i].player;       
                return user.send("Health: " + players[i].health + "\n" + "Level: " + players[i].level + "\n" + "Strength: " + players[i].strength + "\n" + "Defense: " + players[i].defense);              
            }
        
            // warning if your health is low
            if (players[i].health > 0 && players[i].health < 11) {
                message.reply("A fellow player is on death's door.");
            }
            // resets health if you "die"
            if (players[i].health <= 0) {
                players[i].health = 100;
                message.reply("A player has died!");
            }
        }
            
        }
        
    }
    

module.exports = StatsCommand;
