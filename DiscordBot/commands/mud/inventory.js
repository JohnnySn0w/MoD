const {DEBUG} = require('../../globals.js');
const commando = require('discord.js-commando');
const db = require('../../../dbhandler');

class InventoryCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'inventory',
      group: 'mud',
      memberName: 'inventory',
      description: 'Shows player inventory in a PM to the player.'      
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
            // otherwise, direct message the player with their health, strength, and defense            
            message.member.send("Inventory:" +  "\n" + "\n" + "Gold:" + player.inventory.gold + "\n" + "Weapon: " + player.inventory.weapon + "\n" + "Armor: " + player.inventory.armor + "\n" + "Items: " + player.inventory.keys);
            console.log(player);            
        }
    }
  }
        

    

module.exports = InventoryCommand;
