const {deleteMessage} = require('../../globals.js');
const commando = require('discord.js-commando');
const db = require('../../../dbhandler');

class EquipCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'equip',
      group: 'mud',
      memberName: 'equip',
      description: 'Lets a player wield a weapon or put on armor.'      
    });
  }

  async run(message, args) {
    db.getItem(message.member.id, 'players', (data) => this.getPlayer(data, message, args));
    deleteMessage(message);
  }

  getPlayer(data, message, args) {
    // grab the actual player object
    var body = JSON.parse(data.body);
    var player = body.Item;

    // make sure the player is a part of the MUD
    if (player === undefined) {
      message.member.send('It seems that you\'re not a part of the MUD yet! \nUse `?start` in test-zone to get started!');
    } else {
      // grab the item from keys first
      var itemName = args.toLowerCase();
      var item = this.getKey(player, itemName);

      // check to make sure the item isn't a key
      if (item === undefined) {
        item = this.getItem(player, itemName);

        // ensure the item exists
        if (item === undefined) {
          message.member.send(`It doesn't seem that you have the ${args} in your inventory.`);
        } else {
          // make sure the player is equipping a weapon or armor
          if (item.type === 'weapon' || item.type === 'armor') {
            // make sure the item isn't already equipped
            if (item.equipped) {
              message.member.send(`The ${item.name} is already equipped.`);
            } else {
              // equip the item
              this.equipItem(message, player, item);
            }
          } else {
            message.member.send(`Although you have the ${item.name}, you can't equip it.`);
          }
        }
      } else {
        message.member.send(`${item.name} is a key item. You can't equip it.`);
      }
    }
  }

  getKey(player, itemName) {
    // iterate through the player's list of items and check each one's name
    for (var key in player.inventory.keys) {
      if (itemName === player.inventory.keys[key].name.toLowerCase()) {
        return player.inventory.keys[key];
      }
    }

    return undefined;
  }

  getItem(player, itemName) {
    // iterate through the player's list of items and check each one's name
    for (var item in player.inventory.items) {
      if (itemName === player.inventory.items[item].name.toLowerCase()) {
        return player.inventory.items[item];
      }
    }

    return undefined;
  }

  equipItem(message, player, item) {
    // if the player already has an item equipped, dequip it
    if (player.equipment[item.type] !== null) {
      player.inventory.items[player.equipment[item.type]].equipped = false;
    }

    console.log(item);
    console.log(player.inventory.items);
    // set the item as equipped, and make sure the equipment slot is referencing the item
    player.inventory.items[item.id].equipped = true;
    player.equipment[item.type] = item.id;

    // update the player object and message the player
    db.updateItem(player.id, ['inventory', 'equipment'], [player.inventory, player.equipment], 'players', () => {});
    message.member.send(`${item.name} equipped successfully!`);
  }
}
        

    

module.exports = EquipCommand;