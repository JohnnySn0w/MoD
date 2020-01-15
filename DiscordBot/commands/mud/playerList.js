const commando = require('discord.js-commando');
const { bigCheck, generatePlayerList, sendMessagePrivate } = require('../../utilities/globals');
const { COMMAND_CONSTANT } = require('../../Constants/commandConstant');

class PlayerList extends commando.Command {
  static commandInfo() {
    return(
      'Gives a list of players currently in the same room as you.');
  }
  static aliases() { return ['players', 'plist', 'who']; }
  constructor(client) {
    super(client, COMMAND_CONSTANT(
      'playerlist',
      PlayerList.commandInfo(),
      false,
      PlayerList.aliases(),
    ));
  }
  
  async run({ message }) {
    bigCheck(message, this.sendPlayerList);
  }

  sendPlayerList(message, player, room) {
    const content = generatePlayerList(room.players);
    sendMessagePrivate(message, content);
  }
}

module.exports = PlayerList;