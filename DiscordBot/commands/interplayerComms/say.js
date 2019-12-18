const {
  bigCheck,
  commandPrefix,
  sendMessageRoom,
} = require('../../utilities/globals');
const commando = require('discord.js-commando');
const { COMMAND_CONSTANT } = require('../../Constants/commandConstant');

class Say extends commando.Command {
  static commandInfo() {
    return(
      `Lets you talk to other players in the room
      \`${commandPrefix}say <stuff you want to communicate>\``);
  }
  static aliases() { return ['speak','verbalize','convey']; }
  constructor(client) {
    super(client, COMMAND_CONSTANT('say', Say.commandInfo(), false, Say.aliases()));
    this.player = {};
  }

  async run(message, args) {
    bigCheck(message, this.sendToRoom.bind(this), args);
  }

  sendToRoom(message, player, room, args) {
    sendMessageRoom(this.client, `${player.emoji ? player.emoji : ''}${player.characterName} says: "${args}"`, room);
  }
}
module.exports = Say;