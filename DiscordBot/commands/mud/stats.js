const commando = require('discord.js-commando');
const players = require('../../schemas/players'); // place to hold our stats for all players (will replace with database soon)


class StatsCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'stats',
            group: 'mud',
            memberName: 'stats',
            description: 'Shows player stats for the player who calls for them',
            // args lets us type in a number to test that we can decrease our health
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

        var value = args.value; // lets us use our args above
        var player = message.member; // gets player name
        var play_id = message.member.id; // gets player id
        var health = 100; // starting health value for all
        var level = 1;
        var strength = 7;
        var defense = 5;
        console.log(value);
        var damage = Number(value); // makes our args a number we can use

        // checks through our list of players to see what to do next
        for (let i = 0; i < players.length; i++)
        {
            // this places a new player into our list
            if (play_id != players[i].play_id)
            {
                message.reply("you have no stats yet.");
                players[i] = {player, play_id, health, level, strength, defense};
                message.reply("you now have stats");
                message.reply("Health: " + players[i].health);
                message.reply("Level: " + players[i].level);
                message.reply("Strength: " + players[i].strength);
                message.reply("Defense: " + players[i].defense);
                
            }
            // player already exists in the list
            else {
                message.reply("you exist!");
            }
            // damage handling
            if (damage != 0) {
                message.reply("a hit!");
                var dam = new Number(players[i].health) - damage;
                players[i].health = dam;
                message.reply(players[i].health);
            }
                else {
                message.reply("no damage dealt");
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