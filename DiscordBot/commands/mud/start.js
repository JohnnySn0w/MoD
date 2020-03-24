const {
  commandPrefix,
  sendMessagePrivate,
  gameWorldName,
  updateRoomPopulace,
  startingRoom,
  defaultHearth,
  defaultDescription,
} = require('../../utilities/globals');
const commando = require('discord.js-commando');
const { getItem, saveItem } = require('../../utilities/dbhandler');
const { PLAYER_CONSTANT } = require('../../Constants/playerConstant');
const { COMMAND_CONSTANT } = require('../../Constants/commandConstant');

class StartCommand extends commando.Command {
  static commandInfo() {
    return(
      `Creates your character, and lets you play the game.
      \`${commandPrefix}start\``);
  }
  static aliases() { return ['begin']; }
  constructor(client) {
    super(client, COMMAND_CONSTANT('start', StartCommand.commandInfo(), false, StartCommand.aliases()));
    this.player = {};
  }

  async run(message) {
    if (this.client.users.cache.get(message.author.id)) {
      getItem(message.author.id, 'players', (data) => this.getPlayer(message, data));
    } else {
      sendMessagePrivate(message, 'Sorry, you can\'t start playing the game unless you\'re in the game server');
    }
  }

  getPlayer(message, data) {
    // grab the actual player object
    this.player = JSON.parse(data.body).Item;

    if (this.player === undefined) {
      // if the player doesn't exist in the database, check which room they're in
      this.createCharacter(message); 
    }
    else {
      // otherwise, the player is already a part of the database
      sendMessagePrivate(message, 'You\'ve already started the game!');
    }
  }

  createCharacter(message) {
    // if the player is not in the game, create a new player object to push to the db
    this.player = PLAYER_CONSTANT(message, startingRoom, defaultHearth, defaultDescription);
    saveItem(this.player, 'players');
    getItem(startingRoom, 'rooms', (data) => updateRoomPopulace(data, this.player, 'add'));
    this.welcome(message);
  }

  welcome(message) {
    // once the player data is stored on the database, reassign the player's room permissions to the entry room
    sendMessagePrivate(message, `Welcome to ${gameWorldName}! Use \`${commandPrefix}connect\` to login.`);
  }
}

module.exports = StartCommand;