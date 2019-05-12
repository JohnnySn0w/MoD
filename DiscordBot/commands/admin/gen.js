// creates game channels and roles, and assigns those channels their appropriate roles

/*
1. create the channel group
2. create the roles
3. create the channels, assign the perms such that only players with the role can see it, and also message history is hidden.
*/
const commando = require('discord.js-commando');
const rooms = require('../../schemas/rooms.json');
const { deleteMessage, gameWorldName } = require('../../globals.js');

class Gen extends commando.Command {
  //constructor for the class
  //is passed the bot's object as a param
  constructor(client) {
    super(client, {
      name: 'gen',
      group: 'admin',
      ownerOnly: false,
      memberName: 'gen',
      description: 'generates game world on server, based on data rooms.json schema.\nUses the world name set in globals.js as the category name',
      //user permissions
      userPermissions: ['ADMINISTRATOR'],
      args: [
        {
          key: 'object',
          prompt: 'What would you like to generate?',
          type: 'string'
        }
      ]
    });
    this.makeRooms = this.makeRooms.bind(this);
  }
  
  // the core function for the command, runs asynchronously
  async run(message, args) {
    const guild = message.guild;
    args = args.object;
    //create the game world category if not present
    if (guild.channels.find(channel => channel.name === gameWorldName) === null) {
      this.createCategory(guild);
    }
    //iterate through rooms in rooms.json and create the rooms and roles
    if (args === 'roles') {
      this.makeRoles(guild);
    } else if (args === 'rooms') {
      this.makeRooms(guild);
    }
    deleteMessage(message);
  }

  createCategory(guild) {
    guild.createChannel(gameWorldName, {
      type: 'category',
      permissionOverwrites: [{
        id: guild.id.toString(),
        deny: ['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES']
      }]
    }).then(category => console.log(`Created ${category.name}`))
      .catch(console.error);
  }

  makeRoles(guild) {
    rooms.forEach((room) => {
      if(guild.roles.find(role => role.name === room.id) === null) {
        guild.createRole({
          name: room.id.toString(),
          color: '66CDAA',
        }).then(role => console.log(`Created new role with name ${role.name}`))
          .catch(console.error);
      }
    });
    return guild;
  }

  makeRooms(guild) {
    rooms.forEach((room) => {
      if (guild.channels.find(channel => channel.name === room.id) === null) {
        guild.createChannel(room.id, {
          type: 'text',
          parent: guild.channels.find(channel => channel.name === gameWorldName).id,
          permissionOverwrites: [
            {
              id: guild.id.toString(),
              deny: ['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES']
            },
            {
              id: guild.roles.find(role => role.name === room.id).id.toString(),
              allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
              deny: ['READ_MESSAGE_HISTORY']
            }
          ]
        }).then(channel => console.log(`Created new room channel with name ${channel.name}`))
          .catch(e => console.error('makeRoom errored with:', e));
      }
    });
  }
}

// export the class to any 'require' calls in other files
module.exports = Gen;
