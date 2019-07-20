const { deleteMessage, bigCheck, commandPrefix, sendMessagePrivate } = require('../../utilities/globals');
const commando = require('discord.js-commando');
const { COMMAND_CONSTANT } = require('../../Constants/commandConstant');
const { updateItem } = require('../../utilities/dbhandler');

class Disconnect extends commando.Command {
  static commandInfo() {
    return(
      `logout of the game:
      \`${commandPrefix}disconnect\``);
  }
  static aliases() { return ['dc', 'quit', 'logoff', 'logout']; }
  constructor(client) {
    super(client, COMMAND_CONSTANT('disconnect', Disconnect.commandInfo(), false, Disconnect.aliases()));
    this.logoff = this.logoff.bind(this);
  }
  
  async run(message) {
    bigCheck(message, this.logoff);
    deleteMessage(message);
  }

  logoff(message, player) {
    if (!player.isOnline){
      sendMessagePrivate(message, 'You are already offline.');
      return null;
    } else {
      updateItem(player.id, ['isOnline'], [false], 'players');
      sendMessagePrivate(message, `${player.characterName} is now offline.`);
    }
  }
}

module.exports = Disconnect;