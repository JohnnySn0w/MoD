const commando = require('discord.js-commando');
const index = require('../../player-stats');

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
                },
                {
                    key: 'roll',
                    prompt: 'leave the damage up to the roll of a die?',
                    type: 'integer'
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

        for (let i = 0; i < index.players.length; i++)
        {
            if (play_id != index.players[i].play_id)
            {
                message.reply("you have no stats yet.");
                index.players[i] = {player, play_id, health};
                message.reply("you now have stats");
                message.reply(index.players[i].health);
            }
            else {
                message.reply("you exist!");
            }

            if (damage != 0) {
                message.reply("a hit!");
                var dam = new Number(index.players[i].health) - damage;
                index.players[i].health = dam;
                message.reply(index.players[i].health);

                if (rolled)

            } else {
                message.reply("no damage dealt");
            }
        } 
        
    }
}

module.exports = StatsCommand;
module.exports.index = index;
