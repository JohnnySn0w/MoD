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
            let weapon = player.inventory.weapon;
            let armor = player.inventory.armor;
            let itemkeys = player.inventory.keys;
            
            // check to keep the DM from saying null. Instead, if there's nothing, say "None"
            if (weapon == null)
            {
              weapon = "None";
            }
            if (armor == null)
            {
              armor = "None";
            }
            if (itemkeys == null)
            {
              itemkeys = "None";
            }
            // DM the player
            message.member.send(`\`\`\`javascript\n${player.name}ʼs Inventory\nGold: ${player.inventory.gold}\nWeapon: ${weapon}\nArmor: ${armor}\nItems: ${itemkeys}\n\`\`\``);
            console.log(player);            
        }
    }
  }
        

    

module.exports = InventoryCommand;
