const {DEBUG} = require('../../globals.js');
const commando = require('discord.js-commando');
const db = require('../../../dbhandler');

class MoveCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'move',
      group: 'mud',
      memberName: 'move',
      description: 'Moves the user to a different room (i.e. text channel)',
      args: [
        {
          key: 'direction',
          prompt: 'Which direction do you wish to move in?',
          type: 'string'
        }
      ]
    });
  }

  async run(message, {direction}) {
    db.getItem(message.member.id, 'players', (data) => this.getPlayer(message, data, direction));
  }

  getPlayer(message, data, direction) {
    // grab the actual room object
    var body = JSON.parse(data.body);
    var player = body.Item;

    if (player === undefined) {
      message.member.send('It seems that you\'re not a part of the MUD yet! \nUse `?start` in test-zone to get started!');
    }
    else {
      // get the room object that the player is in
      db.getItem(message.channel.id, 'rooms', (data) => this.getRoom(message, player, data, direction, true));
    }
  }

  getRoom(message, player, data, direction, firstRetrieval) {
    // grab the actual room object
    var body = JSON.parse(data.body);
    var room = body.Item;

    if (firstRetrieval) {
      // if we're grabbing the room that the player is currently in, then we need to make sure it's a MUD sanctioned room
      if (room === undefined) {
        // if they're not in a MUD room, alert them of this
        message.member.send('You\'re not in of the MUD-related rooms.');                
      } else {
        // otherwise, clean up the direction passed, and move the player into the next room
        direction = this.cleanArgs(direction);
        this.movePlayer(message, player, direction, room);
      }
    } else {
      // if we're grabbing the room that the player is moving to, assign the player the new room's role ID
      message.channel.send(`${player.name} moved to <#${room.id}>`);
      message.member.setRoles([message.guild.roles.get(room.roleid)]).catch(e => console.error(e));
      const roomy = this.client.channels.find('name', room.id);
      roomy.send(`${player.name} has entered.`);
      
      // delete the user's command if not debugging
      if (!DEBUG) {
        message.delete();
      }
    }
  }

  cleanArgs(direction) {
    // ignore the argument's capitalization
    direction = direction.toLowerCase();
    return direction;
  }

  movePlayer(message, player, direction, room) {
    if (direction in room.exits) {
      // if a room exists in the given direction, use that direction's associated room ID to get the next room
      db.getItem(room.exits[direction], 'rooms', (data) => this.getRoom(message, player, data, direction, false));
    }
    else {
      // otherwise, alert the player of the lack of exits
      message.channel.send(`${player.name} has lost their sense of direction`);

      // delete the user's command if not debugging
      if (!DEBUG) {
        message.delete();
      }
    }
  }
}

module.exports = MoveCommand;