const commando = require('discord.js-commando');
const players = require('../../schemas/players'); // place to hold our stats for all players (will replace with database soon)
//var dbplayer = require('../dbhandler');


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
        var id = message.member.id; 
        console.log(players.length);

        // delete command after saying it!
        message.delete();

        var player;
        for (var i = 0; i < players.length; i++)
        {
            if (id == players[i].id)
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
