const {deleteMessage, bigCheck, commandPrefix} = require('../../globals.js');
const commando = require('discord.js-commando');
const db = require('../../../dbhandler');

class MoveCommand extends commando.Command {
  static commandInfo() {
    return(`Move to a different room (i.e. text channel).
    \`${commandPrefix}move <direction>\``);
  }
  constructor(client) {
    super(client, {
      name: 'move',
      group: 'mud',
      memberName: 'move',
      description: MoveCommand.commandInfo(),
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
    bigCheck(message, this.setRetrieval.bind(this), direction);
    deleteMessage(message);
  }

  setRetrieval(message, player, room, direction) {
    this.getRoom(message, player, room, direction, true);
  }

  getRoom(message, player, room, direction, firstRetrieval) {
    if (!player.busy) {
      if (firstRetrieval) {
        // otherwise, clean up the direction passed, and move the player into the next room
        this.movePlayer(message, player, direction, room);
      } else {
        // grab the actual room object since we did another dynamo call to get it
        const actualRoom = JSON.parse(room.body).Item;
        const nextRoom = this.client.channels.find(channel => channel.name === actualRoom.id);
        // if we're grabbing the room that the player is moving to, assign the player the new room's role ID
        message.channel.send(`${player.characterName} moved to <#${nextRoom.id}>`);
        const roomRole = message.guild.roles.find(role => role.name === actualRoom.id);
        message.member.setRoles([roomRole]).catch(e => console.error(e));
        nextRoom.send(`${player.characterName} has entered.`);
      }
    } else {
      message.channel.send(`${player.characterName} is too busy to move!`);
    }
  }

  movePlayer(message, player, direction, room) {
    if (direction in room.exits) {
      // if a room exists in the given direction, use that direction's associated room ID to get the next room
      db.getItem(room.exits[direction], 'rooms', (data) => this.getRoom(message, player, data, direction, false));
    }
    else {
      // otherwise, alert the player of the lack of exits
      message.channel.send(`${player.characterName} has lost their sense of direction`);
    }
  }
}

module.exports = MoveCommand;