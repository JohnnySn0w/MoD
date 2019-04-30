const globals = require('../../globals.js');
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
    //db.getItem(message.member.id, 'players', (data) => this.getPlayer(message, data, direction));
    globals.bigCheck(message, direction, this.setRetrieval.bind(this));
  }

  setRetrieval(message, direction, player, room) {
    this.getRoom(message, player, room, direction, true);
  }

  getRoom(message, player, room, direction, firstRetrieval) {
    if (!player.busy) {
      if (firstRetrieval) {
        // otherwise, clean up the direction passed, and move the player into the next room
        this.movePlayer(message, player, direction, room);
      }
      else {
        // if we're grabbing the room that the player is moving to, assign the player the new room's role ID
        message.channel.send(`${player.name} moved ${direction}`);
        message.member.setRoles([message.guild.roles.get(room.roleid)]).catch(e => console.error(e));
        const roomy = this.client.channels.find(channel => channel.name === room.id);
        roomy.send(`${player.name} has entered.`);
      
        // delete the user's command if not debugging
        if (!globals.DEBUG) {
          message.delete();
        }
      }
    } 
    else {
      message.channel.send(`${player.name} is too busy to move`);
    }
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