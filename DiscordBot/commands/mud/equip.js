const { deleteMessage } = require('../../globals.js');
const commando = require('discord.js-commando');
const db = require('../../../dbhandler');

class EquipCommand extends commando.Command {
  static commandInfo() {
    return('Equip a weapon or armor.\n`?equip <item>`');
  }
  constructor(client) {
    super(client, {
      name: 'equip',
      group: 'mud',
      memberName: 'equip',
      description: EquipCommand.commandInfo(),
    });
  }

  async run(message, args) {
    this.state = { message: message, itemName: args.toLowerCase() };
    db.getItem(message.author.id, 'players', this.playerCheck.bind(this));
    deleteMessage(message);
  }

  playerCheck(data) {
    const { message } = this.state;
    let player = JSON.parse(data.body).Item;
    if (player === undefined) {
      message.member.send('It seems that you\'re not a part of the MUD yet! \nUse `?start` in #start-here to get started!');
    } else {
      this.state.player = player;
      this.checkItemType();
    }
  }

  checkItemType() {
    const { message, itemName } = this.state;
    // grab the item from keys first
    let item = this.getItem('keys');
    console.log('thsihfdkafhjs', item);
    // check to make sure the item isn't a key
    if (item) {
      message.author.send(`${item.name} is a key item. You can't equip it.`);
      return null;
    }
    item = this.getItem('items');
    console.log('ashciuovxhzcv', item);
    if (item === undefined) {
      message.author.send(`It doesn't seem that you have the ${itemName} in your inventory.`);
      return null;
    }
    // make sure the player is equipping a weapon or armor
    if (item.type === 'weapon' || item.type === 'armor') {
      // equip the item
      this.equipItem(item);
    } else {
      message.author.send(`Although you have the ${item.name}, you can't equip it.`);
    }
    return null;
  }

  getItem(keysOrItems) {
    const { player, itemName } = this.state;
    let thing = undefined;
    // iterate through the player's list of items and check each one's name
    Object.keys(player.inventory[keysOrItems]).forEach((key) => {
      if (itemName === player.inventory[keysOrItems][key].name.toLowerCase()) {
        console.log(player.inventory[keysOrItems][key]);
        thing = player.inventory[keysOrItems][key];
      }
    });
    return thing;
  }

  equipItem(item) {
    const { message, player } = this.state;
    if (item.equipped) {
      message.author.send(`The ${item.name} is already equipped.`);
      return null;
    }
    // set the item as equipped, and make sure the equipment slot is referencing the item
    player.inventory.items[item.id].equipped = true;
    player.equipment[item.type] = item.id;
    // update the player object and message the player
    db.updateItem(player.id, ['inventory', 'equipment'], [player.inventory, player.equipment], 'players', () => {});
    message.author.send(`${item.name} equipped successfully!`);
  }
}
        

    

module.exports = EquipCommand;