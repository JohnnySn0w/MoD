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

  async run(message) {
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
            // otherwise, do stuff here        
        }
    }
  }
  /* plan:
       - parse the args given so that we can get the given words into a single string (ex. 'Short' 'Sword' becomes 'Short Sword')
       - compare this string to what's in player inventory to see if we have the item 
       - if we have it, we then see if it's been assigned to a weapon or armor slot.
          - if it has, we update player attributes by subtracting the strength or defense value of the item from the player's
          - the slot is then made null
       - ultimately, we delete the item from player inventory
       - of course, if we don't have the item, we don't do any of this
  */
        

    

module.exports = DiscardCommand;