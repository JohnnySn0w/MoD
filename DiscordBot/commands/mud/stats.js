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

        var player;
        for (var i = 0; i < players.length; i++)
        {
            if (play_id == players[i].play_id)
            {
                player = players[i];    
                break;                                         
            }
        }

        if (player === undefined) 
        {
            message.reply(" you need to start your adventure first! Please go to the landing zone and enter the start command to proceed.");
        }
        else 
        {
           // how to DM users anything - these two commands right here                     
           message.member.send("Health: " + players[i].health + "\n" + "Level: " + players[i].level + "\n" + "Strength: " + players[i].strength + "\n" + "Defense: " + players[i].defense);  
                
           // warning if your health is low
           if (players[i].health > 0 && players[i].health < 11) {
               message.member.send("You're on death's door, my friend.");
           }     
           
        }

    }
        
}
    

module.exports = StatsCommand;
