const {
  deleteMessage,
  bigCheck,
  commandPrefix,
  sendMessagePrivate,
  sendMessageRoom,
  updateRoomPopulace
} = require('../../utilities/globals');
const commando = require('discord.js-commando');
const { getItem, updateItem} = require('../../utilities/dbhandler');
const { COMMAND_CONSTANT } = require('../../Constants/commandConstant');

class MoveCommand extends commando.Command {
  static commandInfo() {
    return(
      `Move to a different room (i.e. text channel).
      \`${commandPrefix}move <direction>\``);
  }
  static aliases() { return ['go', 'travel', 'climb', 'walk']; }
  constructor(client) {
    super(client, COMMAND_CONSTANT(
      'move',
      MoveCommand.commandInfo(),
      true,
      MoveCommand.aliases(),
    ));
    this.getRoom = this.getRoom.bind(this);
    this.movePlayer = this.movePlayer.bind(this);
    this.state = {
      direction: '',
      player: {},
      message: {},
    };
  }

  async run(message, { object }) {
    this.state.message = message;
    bigCheck(message, this.getRoom, object);
    deleteMessage(message);
  }

  movePlayer({body}) {
    const { player, message } = this.state;
    const nextRoom = JSON.parse(body).Item;
    // if we're grabbing the room that the player is moving to, assign the player the new room's role ID
    getItem(nextRoom.id, 'rooms', (data) => updateRoomPopulace(data, player, 'add'));
    updateItem(player.id, ['currentRoomId'], [nextRoom.id], 'players');
    sendMessagePrivate(message, nextRoom.description);
    sendMessageRoom(this.client,`${player.characterName} has entered.`, nextRoom);
  }

  getRoom(message, player, room, direction) {
    this.state.message = message;
    this.state.player = player;
    this.state.direction = direction;
    if (direction in room.exits) {
      // if a room exists in the given direction, use that direction's associated room ID to get the next room
      getItem(room.exits[direction], 'rooms', this.movePlayer);
      getItem(room.id, 'rooms', (data) => updateRoomPopulace(data, player, 'remove'));
      sendMessageRoom(this.client, `${player.characterName} moved ${direction}`, room);
    }
    else {
      // otherwise, alert the player of the lack of exits
      sendMessageRoom(this.client, `${player.characterName} has lost their sense of direction`, room);
    }
  }
}

module.exports = MoveCommand;