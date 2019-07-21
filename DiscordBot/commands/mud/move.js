const { deleteMessage, bigCheck, commandPrefix, sendMessageRoom } = require('../../utilities/globals');
const commando = require('discord.js-commando');
const { getItem, updateItem} = require('../../utilities/dbhandler');
const { COMMAND_CONSTANT } = require('../../Constants/commandConstant');

class MoveCommand extends commando.Command {
  static commandInfo() {
    return(
      `Move to a different room (i.e. text channel).
      \`${commandPrefix}move <direction>\``);
  }
  static aliases() { return ['go', 'travel', 'climb']; }
  constructor(client) {
    super(client, COMMAND_CONSTANT(
      'move',
      MoveCommand.commandInfo(),
      true,
      MoveCommand.aliases(),
    ));
  }

  async run(message, { object }) {
    //db.getItem(message.member.id, 'players', (data) => this.getPlayer(message, data, direction));
    bigCheck(message, this.setRetrieval.bind(this), object);
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
        sendMessageRoom(message, `${player.characterName} has left`);
        const roomRole = message.guild.roles.find(role => role.name === actualRoom.id);
        message.member.setRoles([roomRole]).catch(e => console.error(e));
        updateItem(player.id, ['currentRoomID'], [actualRoom.id], 'rooms');
        sendMessageRoom(message,`${player.characterName} has entered.`, nextRoom);
      }
    } else {
      sendMessageRoom(message, `${player.characterName} is too busy to move!`);
    }
  }

  movePlayer(message, player, direction, room) {
    if (direction in room.exits) {
      // if a room exists in the given direction, use that direction's associated room ID to get the next room
      getItem(room.exits[direction], 'rooms', (data) => this.getRoom(message, player, data, direction, false));
    }
    else {
      // otherwise, alert the player of the lack of exits
      sendMessageRoom(message, `${player.characterName} has lost their sense of direction`);
    }
  }
}

module.exports = MoveCommand;