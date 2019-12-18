const { commandPrefix, discardItem, sendMessagePrivate } = require('../../utilities/globals');
let {  determineEffects } = require('../../utilities/globals');
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
  static aliases() { return ['use', 'discard', 'equip', 'unequip']; }
  constructor(client) {
    super(client, COMMAND_CONSTANT(
      'item',
      ItemCommand.commandInfo(),
      true,
      ItemCommand.aliases(),
    ));
    determineEffects = determineEffects.bind(this);
  }

  async run(message, { object }) {
    const type = /\w+/.exec(message.content);
    if (type === undefined || type === null) {
      sendMessagePrivate(message,'You need to supply an item name too!');
    } else {
      this.state = {
        message,
        itemName: object.toLowerCase(),
        type: type[0],
      };
      getItem(message.author.id, 'players', this.playerCheck.bind(this));
    }
  }

  playerCheck(data) {
    const { message } = this.state;
    let player = JSON.parse(data.body).Item;
    if (player === undefined) {
      sendMessagePrivate(message, 'It seems that you\'re not a part of the MUD yet! \nUse `?start` in #start-here to get started!');
    } else if(player.busy) {
      return null;
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
    case 'drop':
    case 'yeet':
    case 'discard':
      if (item.equipped && item.amount === 1) {
        sendMessagePrivate(message, `The ${item.name} is equipped, and it's your last item of its kind. Equip something else or unequip it to discard it.`);
        break;
      }
      discardItem(player, item);
      sendMessagePrivate(message, `${item.name} discarded!`);
      break;
    case 'wield':
    case 'wear':
    case 'equip':
      if (item.type === 'weapon' || item.type === 'armor') {
        this.equipItem();
      } else {
        sendMessagePrivate(message, `Although you have the ${item.name}, you can't equip it.`);
      }
      break;
    case 'remove':
    case 'unequip':
    case 'store':
    case 'stow':
      if (!item.equipped) {
        sendMessagePrivate(message, `${item.name} not currently equipped.`);
        break;
      }
      this.unequipItem();
      break;
    case 'use':
      if (item.type === 'consumable') {
        getItem(item.id, 'items', determineEffects);
        discardItem(player, item);
      } else if (item.type === 'weapon' || item.type === 'armor') {
        this.state.type = 'equip';
        this.doThing();
        break;
      } else {
        sendMessagePrivate(message, 'That\'s not a proper way of using that...');
        break;
      }
      break;
    default:
      return null;
    }
  }
}

module.exports = ItemCommand;