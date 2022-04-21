const { commandPrefix, sendMessagePrivate, gameWorldName } = require('../../utilities/globals');
const commando = require('discord.js-commando');
const { COMMAND_CONSTANT } = require('../../Constants/commandConstant');
const { getItem, updateItem } = require('../../utilities/dbhandler');

class Connect extends commando.Command {
  static commandInfo() {
    return(
      `Connect/disconnect from the game:
      \`${commandPrefix}connect\` or similar to login
      \`${commandPrefix}disconnect\` or similar to logout`);
  }
  static aliases() { return ['logon', 'login', 'con', 'connect', 'online', 'dc', 'quit', 'logoff', 'logout', 'offline']; }
  constructor(client) {
    super(client, COMMAND_CONSTANT('connect', Connect.commandInfo(), false, Connect.aliases()));
    this.determineType = this.determineType.bind(this);
  }
  
  async run(message) {
    this.type = /\w+/.exec(message.content)[0];
    this.message = message;
    getItem(message.author.id, 'players', this.determineType);
  }

  determineType({ body }) {
    this.player = JSON.parse(body).Item;
    switch(this.type) {
    case 'con':
    case 'connect':
    case 'login':
    case 'logon':
    case 'online':
      this.login();
      break;
    case 'dc':
    case 'quit':
    case 'logoff':
    case 'logout':
    case 'offline':
      this.logoff();
      break;
    }
  }

  login() {
    if (this.player === undefined) {
      sendMessagePrivate(this.message, 'You need to `start` the game first.');
    }
    if (this.player.isOnline){
      sendMessagePrivate(this.message, 'You are already connected.');
      return null;
    }
    sendMessagePrivate(this.message, `Connected successfully, loading ${this.player.characterName}`);
    updateItem(this.player.id, ['isOnline'], [true], 'players');
    sendMessagePrivate(this.message, `${this.player.characterName} loaded`);
    sendMessagePrivate(this.message, `Welcome back to ${gameWorldName}, ${this.player.characterName}\n\n\n`);
    getItem(this.player.currentRoomId, 'rooms', data => sendMessagePrivate(this.message, JSON.parse(data.body).Item.description));
  }

  logoff() {
    if (!this.player.isOnline){
      sendMessagePrivate(this.message, 'You are already offline.');
      return null;
    } else {
      updateItem(this.player.id, ['isOnline'], [false], 'players');
      sendMessagePrivate(this.message, `${this.player.characterName} is now offline.`);
    }
  }
}

module.exports = Connect;