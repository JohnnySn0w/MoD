const {DEBUG} = require('../../globals.js');
const commando = require('discord.js-commando');
const db = require('../../../dbhandler');

class EquipCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'equip',
      group: 'mud',
      memberName: 'equip',
      description: 'Lets a player arm themselves or put on armor.'      
    });
  }

  async run(message, args) {
    db.getItem(message.member.id, 'players', (data) => this.getPlayer(data, message, args));
    // delete the user's command if not debugging
    if (!DEBUG) {
      message.delete();
    }
  }

  getPlayer(data, message, args) {
    // grab the actual player object
    var body = JSON.parse(data.body);
    var player = body.Item;

    args = args.toLowerCase().replace(/"/g, '');

        if (player === undefined) {
            // if the player isn't in the database already, send them a notice that they need to "?start" the game
            message.member.send("You need to start your adventure first! Please go to the testing zone and enter the start command to proceed.");
        }
        else {
            // do something
            let weapon = player.equipment.weapon;
            let armor = player.equipment.armor;
            let items = player.inventory.items;

            console.log(player.inventory.items);

            if (Object.keys(items).length == 0) {
              console.log("Empty");
            } else {
              for (var item in items) {
                console.log(JSON.stringify(item));
                if (items[item].name.toLowerCase().replace(/"/g, '') == args) {
                  console.log("Match!");
                  if (!items[item].equipped) {
                      if (items[item].type == 'weapon') {
                        weapon = items[item].name;
                        console.log(weapon);
                        console.log(player.equipment.weapon);
                        items[item].equipped = true;
                        console.log(items[item]);
                        player.strength = player.strength + items[item].stats;
                        console.log(player.strength);
                        db.updateItem(player.id, ['strength'], [player.strength], 'players', () => console.log('Player strength updated'));
                      }
                      if (items[item].type == 'armor') {
                        armor = items[item].name;
                        console.log(armor);
                        console.log(player.equipment.armor);
                        items[item].equipped = true;
                        console.log(items[item]);
                        player.defense = player.defense + items[item].stats;
                        console.log(player.defense);
                        db.updateItem(player.id, ['defense'], [player.defense], 'players', () => console.log('Player defense updated'));
                      }
                  }
                }
              }
            }       
    }
    

  /* plan:
      - parse the args given so that we can get the given words into a single string (ex. 'Short' 'Sword' becomes 'Short Sword')
      - compare this string to what's in player inventory to see if we have the item
      - if we have the item, we then check its type and assign the item to the appropriate slot (weapon or armor)
          - we also go find the item in the items table and update player attributes (strength, defense, etc.) based on given values
      - of course, if we don't have that item, we don't do this      

  */
  
  }
}
        

    

module.exports = EquipCommand;