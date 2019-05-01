const {deleteMessage, bigCheck} = require('../../globals.js');
const commando = require('discord.js-commando');
const db = require('../../../dbhandler');

class LookCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'look',
      group: 'mud',
      memberName: 'look',
      description: 'Gives a description of an item in the same room as the user',
      args: [
        {
          key: 'object',
          prompt: 'What are you trying to look at?',
          type: 'string'
        }
      ]
    });
  }

  async run(message, args) {
    bigCheck(message, args.object, this.getRoom.bind(this));
    deleteMessage(message);
  }

  getRoom(message, args, player, room) {
    var object;
    if (args === 'room' || args === 'here') {
      this.replyToPlayer(message, player, true, room);
    }
    else {
      // otherwise, the player is looking at an item, which we need to determine
      object = this.determineItem(args, room);
      if (object === undefined) {
        // if the object doesn't exist, then the player is looking at an NPC, enemy, or nothing
        object = this.determineNPC(args, room);
        if (object === undefined) {
          // if the object still doesn't exist, then the player is looking at an enemy or nothing
          object = this.determineEnemy(args, room);
          if (object === undefined) {
            // the player is not looking at anything
            message.channel.send(`${player.name} stares into space.`);
          } else {
            db.getItem(object, 'enemies', (data) => this.replyToPlayer(message, player, false, room, data));
          }
        } else {
          db.getItem(object, 'npcs', (data) => this.replyToPlayer(message, player, false, room, data));
        }
      } else {
        db.getItem(object, 'items', (data) => this.replyToPlayer(message, player, false, room, data));
      }
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
    
  determineNPC(searchName, room) {
    // determine what NPC the player is looking at in the given room
    var npcObject;
    if (searchName in room.npcs) {
      npcObject = room.npcs[searchName];
    }
		
    return npcObject;
  }

  determineEnemy(searchName, room) {
    // determine what enemy the player is looking at in the given room
    var enemyObject;
    if (searchName in room.enemies) {
      enemyObject = room.enemies[searchName];
    }
    
    return enemyObject;
  }

  replyToPlayer(message, player, objectIsRoom, room, data) {
    try {
      // determine whether the object being looked at is the room itself
      var object;
      if (objectIsRoom === true) {
        object = room;
      } else {
        var body = JSON.parse(data.body);
        var item = body.Item;

        object = item;
      }
          
      // handle situations where either the room or the object may be undefined
      if (room === undefined) {
        message.member.send('You are not in a MUD-related room.');
      }
      else {
        message.channel.send(object.description);
      }
    }
    catch (error) {
      console.log("Looking at an object broke something.\n" + error.message);
      message.channel.send(`${player.name} stares into space.`);
    }
  }
}

module.exports = LookCommand;