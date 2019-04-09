const {DEBUG} = require('../../globals.js');
const commando = require('discord.js-commando');
const db = require('../../../dbhandler');

class StatsCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'stats',
      group: 'mud',
      memberName: 'stats',
      description: 'Shows player stats for the player who calls for them'      
    });
  }

  async run(message) {
    db.getItem(message.member.id, 'players', (data) => this.getPlayer(data, message));
    // delete the user's command if not debugging
    if (!DEBUG) {
      message.delete();
    }
  }

  getPlayer(data, message) {
    // grab the actual player object
    var body = JSON.parse(data.body);
    var player = body.Item;

    if (player === undefined) {
      // if the player isn't in the database already, send them a notice that they need to "?start" the game
      message.member.send('It seems that you\'re not a part of the MUD yet! \nUse `?start` in test-zone to get started!');
    }
    else {
      // otherwise, direct message the player with their health, strength, and defense            
      message.member.send(`Health: ${player.health}\nLevel: ${player.level}\nStrength: ${player.strength}\nDefense: ${player.defense}`);

      // also send a warning if the player's health is low
      if (player.health > 0 && player.health < 11) {
        message.member.send('You\'re on death\'s door, my friend.');
      }
    }
  }
        
}
    

module.exports = StatsCommand;
