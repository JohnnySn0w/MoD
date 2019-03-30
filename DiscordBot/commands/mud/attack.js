const {DEBUG} = require('../../globals.js');
const commando = require('discord.js-commando');
const db = require('../../../dbhandler');

class AttackCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'look',
      group: 'mud',
      memberName: 'look',
      description: 'Engages player in combat with ',
      args: [
        {
          key: 'object',
          prompt: 'What are you trying to attack?',
          type: 'string'
        }
      ]
    });
  }

  async run(message, args) {
    // delete the user's command if not debugging
    if (!DEBUG)
      message.delete();

    db.getItem(message.member.id, 'players', (data) => this.getPlayer(message, data, args));
  }

  getPlayer(message, data, args) {
    // grab the actual room object
    var body = JSON.parse(data.body);
    var player = body.Item;

    if (player === undefined) {
      message.reply("it seems that you're not a part of the MUD yet! \nUse \"?start\" in test-zone to get started!");
    }
    else {
      // get the room object that the player is in
      db.getItem(message.channel.id, 'rooms', (data) => this.getRoom(message, data, args));
    }
  }

  getRoom(message, data, args) {
    // grab the actual room object
    var body = JSON.parse(data.body);
    var room = body.Item;

    args = this.cleanArgs(args);

    var object;
    if (args.object === "room" || args.object === "here") {
      this.replyToPlayer(message, true, room);
    }
    else {
      // otherwise, the player is looking at an item, which we need to determine
      object = this.determineItem(args.object, room);
      if (object === undefined) {
        // if the object doesn't exist, then the player is looking at an entity
        object = this.determineNPC(args.object, room);
        db.getItem(object, 'entities', (data) => this.replyToPlayer(message, false, room, data));
      } else {
        db.getItem(object, 'items', (data) => this.replyToPlayer(message, false, room, data));
      }
    }
  }

  cleanArgs(args) {
    // ignore the argument's capitalization
    args.object = args.object.toLowerCase();
    return args;
  }
    
  determineEnemy(searchName, room) {
    // determine what NPC the player is looking at in the given room
    if (searchName in room.enemies) {
      return room.enemies[searchName];
    }
  }

  replyToPlayer(message, objectIsRoom, room, data) {
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
      message.reply("You are not in a MUD-related room.");
    }
    else {
      if (object === undefined) {
        message.reply("I'm not sure what you're trying to look at.");
      }
      else {
        message.reply(object.description);
      }
    }
  }
}

module.exports = AttackCommand;