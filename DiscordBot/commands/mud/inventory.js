const {deleteMessage} = require('../../globals.js');
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
    deleteMessage(message);
  }

  getPlayer(data, message) {
    // grab the actual player object
    var body = JSON.parse(data.body);
    var player = body.Item;

    if (player === undefined) {
        // if the player isn't in the database already, send them a notice that they need to "?start" the game
        message.member.send("You need to start your adventure first! Please go to the testing zone and enter the start command to proceed.");
    } else {
      // otherwise, direct message the player with their health, strength, and defense
      let weapon = player.equipment.weapon;
      let armor = player.equipment.armor;
      let keys = player.inventory.keys;
      let items = player.inventory.items;
      let keyList = "";
      let itemList = "";
      
      // check to keep the DM from saying null. Instead, if there's nothing, say "None"
      if (weapon == null) {
        weapon = "None Equipped";
      } else {
        weapon = player.inventory.items[weapon].name;
      }
      
      if (armor == null) {
        armor = "None Equipped";
      } else {
        armor = player.inventory.items[armor].name;
      }

      if (Object.keys(keys).length == 0) {
        keyList = "Empty";
      } else {
        for (var key in keys) {
          keyList = `${keyList}\n${keys[key].name}`
        }
      }

      if (Object.keys(items).length == 0) {
        itemList = "Empty";
      } else {
        for (var item in items) {
          itemList = `${itemList}\n${items[item].name} x${items[item].amount}`
        }
      }

      // DM the player
      message.member.send(`\`\`\`javascript\n${player.name}ʼs Inventory\nGold: ${player.inventory.gold}\nWeapon: ${weapon}\nArmor: ${armor}\n\nKey Items: ${keyList}\n\nItems: ${itemList}\`\`\``);            
    }
  }
}

module.exports = InventoryCommand;
