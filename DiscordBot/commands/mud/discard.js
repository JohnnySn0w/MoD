const {deleteMessage} = require('../../globals.js');
const commando = require('discord.js-commando');
const db = require('../../../dbhandler');

class DiscardCommand extends commando.Command {
  static commandInfo() {
    return('Remove an item from inventory.\n`?discard <item>`');
  }
  constructor(client) {
    super(client, {
      name: 'discard',
      group: 'mud',
      memberName: 'discard',
      description: DiscardCommand.commandInfo(),
    });
  }

  async run(message, args) {
    db.getItem(message.author.id, 'players', (data) => this.getPlayer(data, message, args));
    deleteMessage(message);
  }

  getPlayer(data, message, args) {
    // grab the actual player object
    var body = JSON.parse(data.body);
    var player = body.Item;

    // make sure the player is a part of the MUD
    if (player === undefined) {
      message.author.send('It seems that you\'re not a part of the MUD yet! \nUse `?start` in test-zone to get started!');
    } else {
      // grab the item from keys first
      var itemName = args.toLowerCase();
      var item = this.getKey(player, itemName);

      // check to make sure the item isn't a key
      if (item === undefined) {
        item = this.getItem(player, itemName);

        // ensure the item exists
        if (item === undefined) {
          message.author.send(`It doesn't seem that you have the ${args} in your inventory.`);
        } else {
          // make sure the item isn't already equipped
          if (item.equipped && item.amount == 1) {
            message.author.send(`The ${item.name} is equipped, and it's your last item of its kind. Equip something else to discard it.`);
          } else {
            // discard the item
            this.discardItem(message, player, item);
          }
        }
      } else {
        message.author.send(`${item.name} is a key item. You can't discard it.`);
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

  discardItem(message, player, item) {
    // if the player has multiples of the item, just remove one - otherwise delete the entire item
    if (item.amount > 1) {
      player.inventory.items[item.id].amount -= 1;
    } else {
      delete player.inventory.items[item.id];
    }

    // update the player object and message the player
    db.updateItem(player.id, ['inventory', 'equipment'], [player.inventory, player.equipment], 'players', () => {});
    message.author.send(`${item.name} was discarded.`);
  }
}

module.exports = DiscardCommand;