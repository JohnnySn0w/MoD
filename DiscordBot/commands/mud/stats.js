const commando = require('discord.js-commando');
const players = require('../../schemas/players');

class StatsCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'stats',
            group: 'mud',
            memberName: 'stats',
            description: 'Shows player stats for the player who calls for them',
            args: [
                {
                    key: 'value',
                    prompt: 'how much damage to inflict?',
                    type: 'integer',
                    default: "0"
                }
            ]
        
        });
    }

    async run(message, args) {
        var value = args.value;
        var die = args.roll;
        var player = message.member;
        var play_id = message.member.id;
        var health = 100;
        console.log(value);
        var damage = Number(value);
        var rolled = Number(die);

        for (let i = 0; i < players.length; i++)
        {
            if (play_id != players[i].play_id)
            {
                message.reply("you have no stats yet.");
                players[i] = {player, play_id, health};
                message.reply("you now have stats");
                message.reply(players[i].health);
            }
            else {
                message.reply("you exist!");
            }

            if (damage != 0) {
                message.reply("a hit!");
                var dam = new Number(players[i].health) - damage;
                players[i].health = dam;
                message.reply(players[i].health);
            }
                else {
                message.reply("no damage dealt");
            }

            if (players[i].health <= 0) {
                players[i].health = 100;
                message.reply("Resetting health. Now back at 100.");
            }
            
        } 
        
    }
}


module.exports = StatsCommand;
