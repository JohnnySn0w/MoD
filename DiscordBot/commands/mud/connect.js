const { deleteMessage, bigCheck, commandPrefix, sendMessagePrivate, gameWorldName } = require('../../utilities/globals');
const commando = require('discord.js-commando');
const { COMMAND_CONSTANT } = require('../../Constants/commandConstant');
const { updateItem } = require('../../utilities/dbhandler');

class Connect extends commando.Command {
  static commandInfo() {
    return(
      `Connect/login to the game:
      \`${commandPrefix}connect\``);
  }
  static aliases() { return ['logon', 'login']; }
  constructor(client) {
    super(client, COMMAND_CONSTANT('connect', Connect.commandInfo(), false, Connect.aliases()));
    this.login = this.login.bind(this);
  }
  
  async run(message) {
    bigCheck(message, this.login);
    deleteMessage(message);
  }

  login(message, player) {
    if (player.isOnline){
      sendMessagePrivate(message, 'You are already connected.');
      return null;
    }
    sendMessagePrivate(message, `Connected successfully, loading ${player.characterName}`);
    updateItem(player.id, ['isOnline'], [true], 'players');
    sendMessagePrivate(message, `${player.characterName} loaded`);
    sendMessagePrivate(message, `Welcome back to ${gameWorldName}, ${player.characterName}`);
  }
}

module.exports = Connect;