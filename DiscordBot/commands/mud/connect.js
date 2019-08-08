const { commandPrefix, sendMessagePrivate, gameWorldName } = require('../../utilities/globals');
const commando = require('discord.js-commando');
const { COMMAND_CONSTANT } = require('../../Constants/commandConstant');
const { getItem, updateItem } = require('../../utilities/dbhandler');

class Connect extends commando.Command {
  static commandInfo() {
    return(
      `Connect/login to the game:
      \`${commandPrefix}connect\``);
  }
  static aliases() { return ['logon', 'login', 'con']; }
  constructor(client) {
    super(client, COMMAND_CONSTANT('connect', Connect.commandInfo(), false, Connect.aliases()));
    this.login = this.login.bind(this);
  }
  
  async run(message) {
    getItem(message.author.id, 'players', data => this.login(message, data));
  }

  login(message, { body }) {
    const player = JSON.parse(body).Item;
    if (player === undefined) {
      sendMessagePrivate(message, 'You need to `start` the game first.');
    }
    if (player.isOnline){
      sendMessagePrivate(message, 'You are already connected.');
      return null;
    }
    sendMessagePrivate(message, `Connected successfully, loading ${player.characterName}`);
    updateItem(player.id, ['isOnline'], [true], 'players');
    sendMessagePrivate(message, `${player.characterName} loaded`);
    sendMessagePrivate(message, `Welcome back to ${gameWorldName}, ${player.characterName}\n\n\n`);
    getItem(player.currentRoomId, 'rooms', data => sendMessagePrivate(message, JSON.parse(data.body).Item.description));
  }
}

module.exports = Connect;