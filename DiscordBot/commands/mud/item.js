const { deleteMessage, commandPrefix, discardItem, sendMessagePrivate } = require('../../utilities/globals');
const commando = require('discord.js-commando');
const { getItem, updateItem } = require('../../utilities/dbhandler');
const { COMMAND_CONSTANT } = require('../../Constants/commandConstant');

class ItemCommand extends commando.Command {
  static commandInfo() {
    return(
      `The Item command has 3 sub-commands:
      Equip a weapon or armor: \`${commandPrefix}item equip <item>\`
      Remove an item from inventory: \`${commandPrefix}item discard <item>\`
      Unequip a weapon or armor: \`${commandPrefix}item unequip <item>\``
    );
  }
  static aliases() { return ['items']; }
  constructor(client) {
    super(client, COMMAND_CONSTANT(
      'item',
      ItemCommand.commandInfo(),
      true,
      ItemCommand.aliases(),
    ));
  }

  async run(message, args) {
    const arguements = /\w+\s/.exec(args);
    this.state = {
      message,
      itemName: arguements.input.replace(arguements[0],'').toLowerCase(),
      type: arguements[0].replace(/\s/, ''),
    };
    getItem(message.author.id, 'players', this.playerCheck.bind(this));
    deleteMessage(message);
  }

  playerCheck(data) {
    const { message } = this.state;
    let player = JSON.parse(data.body).Item;
    if (player === undefined) {
      sendMessagePrivate(message, 'It seems that you\'re not a part of the MUD yet! \nUse `?start` in #start-here to get started!');
    } else {
      this.state.player = player;
      this.checkItemType();
    }
  }

  checkItemType() {
    const { message, itemName } = this.state;
    // grab the item from keys first
    let item = this.getItem('keys');
    // check to make sure the item isn't a key
    if (item) {
      sendMessagePrivate(message, `${item.name} is a key item. You can't do that to it.`);
      return null;
    }
    item = this.getItem('items');
    if (item === undefined) {
      sendMessagePrivate(message, `It doesn't seem that you have the ${itemName} in your inventory.`);
      return null;
    }
    this.state.item = item;
    this.doThing();
    return null;
  }

  getItem(keysOrItems) {
    const { player, itemName } = this.state;
    let thing = undefined;
    // iterate through the player's list of items and check each one's name
    Object.keys(player.inventory[keysOrItems]).forEach((key) => {
      if (itemName === player.inventory[keysOrItems][key].name.toLowerCase()) {
        thing = player.inventory[keysOrItems][key];
      }
    });
    return thing;
  }

  equipItem() {
    const { message, player, item } = this.state;
    if (item.equipped) {
      sendMessagePrivate(message, `The ${item.name} is already equipped.`);
      return null;
    }
    player.inventory.items[item.id].equipped = true;
    player.equipment[item.type] = item.id;
    // update the player object and message the player
    updateItem(player.id, ['inventory', 'equipment'], [player.inventory, player.equipment], 'players', () => {});
    sendMessagePrivate(message, `${item.name} equipped successfully!`);
  }

  unequipItem() {
    const { player, message, item } = this.state;
    player.inventory.items[item.id].equipped = false;
    player.equipment[item.type] = undefined;
    // update the player object and message the player
    updateItem(player.id, ['inventory', 'equipment'], [player.inventory, player.equipment], 'players', () => {});
    sendMessagePrivate(message, `${item.name} un-equipped successfully!`);
  }

  doThing() {
    const { message, player, type, item } = this.state;
    switch (type) {
    case 'equip':
      if (item.type === 'weapon' || item.type === 'armor') {
        this.equipItem();
      } else {
        sendMessagePrivate(message, `Although you have the ${item.name}, you can't equip it.`);
      }
      break;
    case 'unequip':
      if (!item.equipped) {
        sendMessagePrivate(message, `${item.name} not currently equipped.`);
        break;
      }
      this.unequipItem();
      break;
    case 'discard':
      if (item.equipped && item.amount === 1) {
        sendMessagePrivate(message, `The ${item.name} is equipped, and it's your last item of its kind. Equip something else to discard it.`);
        break;
      }
      discardItem(player, item);
      sendMessagePrivate(message, `${item.name} discarded!`);
      break;
    default:
      return null;
    }
  }
}

module.exports = ItemCommand;