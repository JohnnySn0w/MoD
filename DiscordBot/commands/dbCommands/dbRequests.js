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
    this.logger = this.logger.bind(this);
    this.replies = this.replies.bind(this);
  }
  // this currently only outputs in the terminal the bot is running in
  logger(data) {
    console.log(`${data}\nCode: ${data.statusCode} \nItem: `);
    console.log(data);
  }

  // sends data received to logger, replies with status
  replies(message, data, type) {
    this.logger(data);
    if (type === 'get') {
      message.reply('got');
    }
    if (type === 'save') {
      message.reply('saved');
    }
  }

  // sanitize the arguments passed for the object
  cleanArguments(args) {
    // args.object = args.object.toLowerCase();
    const stringArray = args.object.split(/\s+/);
    return stringArray;
  }
  
  // added save and get 
  async run(message, args) {
    args = this.cleanArguments(args);
    if (message.channel.name == 'room-of-entry') {
      if(args[0] === 'save') {
        args[1] = JSON.stringify(args[1]);
        db.saveItem(dumbDynamoRoom, (data) => this.replies(message, data, 'save'));
      } else if (args[0] === 'get') {
        db.getItem(args[1], (data) => this.replies(message, data, 'get'));
      }
    }
  }
}

//placeholder dummy data from eric's scheme
const dumbDynamoRoom = {'name':'entry','itemId':'1','description':'asdf','exits':{},'items':[],'npcs':[],'enemies':[]};

module.exports = DB;