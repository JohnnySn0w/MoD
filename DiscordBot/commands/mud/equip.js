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

    if (player === undefined) {
      message.member.send('It seems that you\'re not a part of the MUD yet! \nUse `?start` in test-zone to get started!');
    } else {
      var itemName = args.toLowerCase();

      if (itemName === "nothing") {
        
      } else {
        var item = this.getItem(player, itemName);

        if (item === undefined) {
          message.member.send(`It doesn't seem that you have the ${args} in your inventory.`);
        } else {
          if (item.type === 'weapon' || item.type === 'armor') {
            if (item.equipped) {
              message.member.send(`The ${item.name} is already equipped`);
            } else {
              this.equipItem(message, player, item);
            }
          } else {
            message.member.send(`Although you have the ${item.name}, you can't equip it`);
          }
        }
      }
    }
  }

  getItem(player, itemName) {
    for (var item in player.inventory.items) {
      console.log(player.inventory.items[item])
      if (itemName === player.inventory.items[item].name.toLowerCase()) {
        return player.inventory.items[item];
      }
    }

    return undefined;
  }

  equipItem(message, player, item) {
    if (player.equipment[item.type] !== null) {
      player.inventory.items[player.equipment[item.type]].equipped = false;
    }

    console.log(item);
    console.log(player.inventory.items);
    player.inventory.items[item.id].equipped = true;
    player.equipment[item.type] = item.id;
    db.updateItem(player.id, ['inventory', 'equipment'], [player.inventory, player.equipment], 'players', () => {});
    message.member.send(`${item.name} equipped successfully!`);
  }
}
        

    

module.exports = EquipCommand;