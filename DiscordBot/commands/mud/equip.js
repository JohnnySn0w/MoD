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
    args = args;

        if (player === undefined) {
            // if the player isn't in the database already, send them a notice that they need to "?start" the game
            message.member.send("You need to start your adventure first! Please go to the testing zone and enter the start command to proceed.");
        }
        else {
            // do something
            console.log(args);
    }
  }

  determineItem(searchName, room) {
    // determine what item the player is looking at in the given room
    var itemObject;
    if (searchName in room.items) {
      itemObject = room.items[searchName];
    }

    return itemObject;
  }
  }
        

    

module.exports = EquipCommand;