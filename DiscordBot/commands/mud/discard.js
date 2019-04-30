const {DEBUG} = require('../../globals.js');
const commando = require('discord.js-commando');
const db = require('../../../dbhandler');

class DiscardCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'discard',
      group: 'mud',
      memberName: 'discard',
      description: 'Lets a player toss out items in their inventory.'      
    });
  }

  async run(message, arge) {
    db.getItem(message.member.id, 'players', (data) => this.getPlayer(data, message));
    // delete the user's command if not debugging
    if (!DEBUG) {
      message.delete();
    }
  }

  getPlayer(data, message) {
    // grab the actual player object
    var body = JSON.parse(data.body);
    var player = body.Item;

        if (player === undefined) {
            // if the player isn't in the database already, send them a notice that they need to "?start" the game
            message.member.send("You need to start your adventure first! Please go to the testing zone and enter the start command to proceed.");
        }
        else {
            discardItem(player, data, args);       
        }
    }
    discardItem(player, data, args) {
      //so to discard, we need to make sure tehy picked a number in the range
      if(player.inventory[args]){ // check if the item exists
        if(player.inventory[args].type === "weapon" || player.inventory[args].type === "armor"){// checking if the item is an equipment
          //then if it's an equipped item, we need to midify the appropriate stats before discarding the item
          // so something like
          /* if(item.equipped){
            update appropriate stat (strength or defense)
            then remove the item
          }
          */
        } 
        else //not an equipment
        {
          //just discard the item
        }
      }
      else{
        //item doesn't exist at index [args]
      }  
    }
  }
        

    

module.exports = DiscardCommand;