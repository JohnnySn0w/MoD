const {
  deleteMessage,
  bigCheck,
  checkItems,
  checkKeys,
  commandPrefix,
  sendMessageRoom,
  sendMessagePrivate, 
} = require('../../utilities/globals');
const commando = require('discord.js-commando');
const db = require('../../utilities/dbhandler');
const inventory = require('./inventory');
const { COMMAND_CONSTANT } = require('../../Constants/commandConstant');

class LookCommand extends commando.Command {
  static commandInfo() {
    return(
      `Gives a description of an entity, place, or thing
      \`${commandPrefix}look <something>\`
      example somethings: \`here\`, \`around\`, \`room\`, \`old man\``);
  }
  static aliases() { return ['view', 'observe', 'here', 'where'];}
  constructor(client) {
    super(client, COMMAND_CONSTANT(
      'look',
      LookCommand.commandInfo(),
      true,
      LookCommand.aliases(),
    ));
  }

  async run(message, args) {
    bigCheck(message, this.getRoom.bind(this), args.object);
    deleteMessage(message);
  }

  getRoom(message, player, room, args) {
    var object;
    if (args === '' || args === 'room' || args === 'here'|| args === 'around' || args === 'area') {
      this.replyToPlayer(message, player, true, room);
    }
    else if (args === 'inventory' || args === 'items' || args === 'equipped' || args === 'equipment') {
      var command = new inventory(this.client);
      command.run(message);
    }
    else {
      // otherwise, the player is looking at an item, which we need to determine
      object = this.determineItem(args, room, player);
      if (object === undefined) {
        // if the object doesn't exist, then the player is looking at an NPC, enemy, or nothing
        object = this.determineNPC(args, room);
        if (object === undefined) {
          // if the object still doesn't exist, then the player is looking at an enemy or nothing
          object = this.determineEnemy(args, room);
          if (object === undefined) {
            // the player is not looking at anything
            sendMessageRoom(this.client, `${player.characterName} stares into space.`, room);
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

  determineItem(searchName, room, player) {
    // determine what item the player is looking at in the given room
    var itemObject;
    if (searchName in room.items) {
      itemObject = room.items[searchName];
    } else if (checkKeys(player, searchName) !== undefined) {
      itemObject = checkKeys(player, searchName);
    } else if (checkItems(player, searchName) !== undefined) {
      itemObject = checkItems(player, searchName);
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
        object.description = `${object.description}\nExits are: ${Object.keys(object.exits).toString()}`;
      } else {
        var body = JSON.parse(data.body);
        var item = body.Item;

        object = item;
      }
          
      // handle situations where either the room or the object may be undefined
      if (room === undefined) {
        sendMessagePrivate(message, 'You are not in a MUD-related room.');
      }
      else {
        sendMessagePrivate(message, object.description);
      }
    }
    catch (error) {
      console.error('Looking at an object broke something.\n' + error.message);
      sendMessageRoom(this.client, `${player.characterName} stares into space.`, room);
    }
  }
}

module.exports = LookCommand;