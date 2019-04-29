const {DEBUG} = require('../../globals.js');
const commando = require('discord.js-commando');
const db = require('../../../dbhandler');

class EquipCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'equip',
      group: 'mud',
      memberName: 'equip',
      description: 'Lets a player arm themselves or put on armor.'      
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
            message.member.send("You need to start your adventure first! Please go to the testing zone and enter the start command to proceed.");
        }
        else {
            // otherwise, do stuff here        
        }
    }
  }
        

    

module.exports = EquipCommand;
