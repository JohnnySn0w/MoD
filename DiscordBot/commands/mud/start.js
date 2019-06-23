const { deleteMessage, commandPrefix} = require('../../globals.js');
const commando = require('discord.js-commando');
const db = require('../../../dbhandler');
const { PLAYER_CONSTANT } = require('../../Constants/playerConstant');

class StartCommand extends commando.Command {
  static commandInfo() {
    return(`Creates your character, and lets you play the game.
    \`${commandPrefix}start\``);
  }
  constructor(client) {
    super(client, {
      name: 'start',
      group: 'mud',
      memberName: 'start',
      description: StartCommand.commandInfo(),
    });
  }

  async run(message) {
    db.getItem(message.author.id, 'players', (data) => this.getPlayer(message, data));
    deleteMessage(message);
  }

  getPlayer(message, data) {
    // grab the actual player object
    var body = JSON.parse(data.body);
    var player = body.Item;

    if (player === undefined) {
      // if the player doesn't exist in the database, check which room they're in
      db.getItem(message.channel.name, 'rooms', (data) => this.getRoom(message, data));
    }
    else {
      // otherwise, the player is already a part of the database
      message.author.send('You\'ve already started the MUD!');
    }
  }

  getRoom(message, data) {
    // grab the actual room object
    var body = JSON.parse(data.body);
    var room = body.Item;

    if (room === undefined) {
      // if the player is not in a MUD room, create a new player object to push to the db
      var newPlayer = PLAYER_CONSTANT(message);
      db.saveItem(newPlayer, 'players', () => this.setRoles(message));
    }
    else {
      // otherwise, direct the user to where they can start the game at
      message.author.send('Sorry, you can\'t start playing the MUD unless you start in a non-MUD room.');
    }
  }

  setRoles(message) {
    // once the player data is stored on the database, reassign the player's room permissions to the entry room
    const entryRoomRole = message.guild.roles.find(role => role.name === 'a-journey-begins');
    message.reply('Welcome to the MUD! Your journey starts in the above text channels. Good luck!');
    message.member.setRoles([entryRoomRole]).catch(e => console.error(e));
  }
}

module.exports = StartCommand;