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
    
        if (player === undefined) {
            // if the player isn't in the database already, send them a notice that they need to "?start" the game
            message.member.send("You need to start your adventure first! Please go to the testing zone and enter the start command to proceed.");
        }
        else {
            equipItem(player, data, args);
        }
    }

  equipItem(player, data, args) {
    if(player.inventory[args] && (player.inventory[args].type === "weapon" || player.inventory[args].type === "armor")){ // if the invenotry item exists and it's a weapon/armor
      //how are we marking things as equipped?
      //mark the item as equipped and un-mark anything that may already be equipped
      // add the modifier of the weapon/armor to the BASE stats.
      // we don't want to just add the modifier to what's there becuase they may already have a modifier? (something equipped)
      // or we could handle it differetly in attack where the modifier of the equipment is fetched every time the attack command is called?
      // it's a tricky one

      // my vote is to just change the number in the player stats so that attack doesn't have to be modified
      // but that means we'll ahve to keep track of the BASE stats for whatever level they are?

      // ORRRRRRRR

      // we can just see if there is something already equipped, then we'll know what number to subtract from the stats before we add the new modifier
      // i think this makes more sense to do
      /*
      check if something is already equipped, and if so, remove(subtract) that modifier from the stats and unmark the old equipment as equipped
            (this should be fine to do even if attempting to equip soemthing that is already equipped)
            (the code should just unequip it and the re-equip it)

      if not, just add the new modifier and mark item as equipped
      */
      }
    }
  }
        

    

module.exports = EquipCommand;