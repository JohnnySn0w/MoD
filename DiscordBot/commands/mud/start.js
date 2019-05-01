const {deleteMessage} = require('../../globals.js');
const commando = require('discord.js-commando');
const db = require('../../../dbhandler');

class StartCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'start',
      group: 'mud',
      memberName: 'start',
      description: 'Sets the player on his or her journey into the MUD'
    });
  }

  async run(message) {
    db.getItem(message.member.id, 'players', (data) => this.getPlayer(message, data));
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
      message.member.send('You\'ve already started the MUD!');
    }
  }

  getRoom(message, data) {
    // grab the actual room object
    var body = JSON.parse(data.body);
    var room = body.Item;

    if (room === undefined) {
      // if the player is not in a MUD room, create a new player object to push to the db
      var newPlayer = {
        'name': message.member.user.username,
        'id': message.member.id,
        'health': 100,
        'maxhealth': 100,
        'currentLevel': 1,
        'strength': 7,
        'defense': 5,
        'experience': 0,
        'nextLevelExperience': 100,
        'inventory': {
          'keys': {
          },
          'items': {
          },
          'gold': 50
        },
        'equipment': {
          'weapon': null,
          'armor': null
        },
        'busy': false,
        'progress': {'npc':{}} // progress is added dynamically with each new npc encounter now :^)
      };
      db.saveItem(newPlayer, 'players', () => this.setRoles(message));
    }
    else {
      // otherwise, direct the user to where they can start the game at
      message.member.send('Sorry, you can\'t start playing the MUD unless you start in a non-MUD room.');
    }
  }

  setRoles(message) {
    // once the player data is stored on the database, reassign the player's room permissions to the entry room
    const entryRoomRole = message.guild.roles.find(role => role.name === 'entry-room');
    message.reply('Welcome to the MUD! Your journey starts in the above text channels. Good luck!');
    message.member.setRoles([entryRoomRole]).catch(e => console.error(e));
  }
}

module.exports = StartCommand;