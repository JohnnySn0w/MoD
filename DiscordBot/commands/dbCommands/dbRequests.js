const commando = require('discord.js-commando');
const db = require('../../../dbhandler');

class DB extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'db',
      group: 'mud',
      memberName: 'db',
      description: 'loads a given object into the db',
      args: [
        {
          key: 'object',
          prompt: 'handle db item entries',
          type: 'string'
        }
      ]
    });
  }

  // this currently only outputs in the terminal the bot is running in
  itemSaved(response) {
    console.log(`Code: ${response.statusCode} \nItem: ${response.body}`);
  }

  // sanitize the arguments passed for the object
  cleanArguments(args) {
    args.object = args.object.toLowerCase();
    return args;
  }
  
  // added save and get 
  async run(message, args) {
    args = this.cleanArguments(args);
    if (message.channel.name == 'room-of-entry') {
      if(args.object === 'save') {
        db.saveItem(dumbDynamoRoom, this.itemSaved);
        message.reply('loaded');
      } else if (args.object === 'get') {
        db.getItem('1', this.itemSaved);
        message.reply('item got');
      }
    }
  }
}

//placeholder dummy data from eric's scheme
const dumbDynamoRoom = {
  'name': 'entry',
  'itemId': '1',
  'description': 'asdf',
  'exits': {
          
  },
  'items': [
  
  ],
  'npcs': [
  
  ],
  'enemies': [
  
  ]
};

module.exports = DB;