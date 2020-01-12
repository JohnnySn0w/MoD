const { commandPrefix, sendMessagePrivate} = require('../../utilities/globals');
const commando = require('discord.js-commando');
const { getItem } = require('../../utilities/dbhandler');
const { COMMAND_CONSTANT } = require('../../Constants/commandConstant');

class InventoryCommand extends commando.Command {
  static commandInfo() {
    return(
      `Shows inventory in a PM.
      \`${commandPrefix}inventory\``);
  }
  static aliases() { return ['bag','inv', 'i']; }
  constructor(client) {
    super(client, COMMAND_CONSTANT(
      'inventory',
      InventoryCommand.commandInfo(),
      false,
      InventoryCommand.aliases(),
    ));
  }

  async run(message) {
    getItem(message.author.id, 'players', (data) => this.getPlayer(data, message));
  }

  getPlayer({ body }, message) {
    // grab the actual player object
    const player = JSON.parse(body).Item;

    if (player === undefined) {
      // if the player isn't in the database already, send them a notice that they need to "?start" the game
      sendMessagePrivate(message, 'You need to start your adventure first! Please go to the testing zone and enter the start command to proceed.');
    } else {
      // otherwise, direct message the player with their health, strength, and defense
      let weapon = player.equipment.weapon;
      let armor = player.equipment.armor;
      let keys = player.inventory.keys;
      let items = player.inventory.items;
      let keyList = '';
      let itemList = '';
      
      // check to keep the DM from saying null. Instead, if there's nothing, say "None"
      if (weapon == null) {
        weapon = 'None Equipped';
      } else {
        weapon = player.inventory.items[weapon].name;
      }
      
      if (armor == null) {
        armor = 'None Equipped';
      } else {
        armor = player.inventory.items[armor].name;
      }

      if (Object.keys(keys).length == 0) {
        keyList = 'Empty';
      } else {
        for (var key in keys) {
          keyList = `${keyList}\n${keys[key].name}`;
        }
      }

      if (Object.keys(items).length == 0) {
        itemList = 'Empty';
      } else {
        for (var item in items) {
          itemList = `${itemList}\n${items[item].name} x${items[item].amount}`;
        }
      }

      // DM the player
      sendMessagePrivate(message, `\`\`\`javascript\n${player.characterName}ʼs Inventory\nGold: ${player.inventory.gold}\nWeapon: ${weapon}\nArmor: ${armor}\n\nKey Items: ${keyList}\n\nItems: ${itemList}\`\`\``);            
    }
  }
}

module.exports = InventoryCommand;
