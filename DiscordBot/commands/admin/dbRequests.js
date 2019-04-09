/*
  kind of an example command
*/

// importing from other files
const commando = require('discord.js-commando');

// import the dbhandler functions, accessible by using db.whateverFunction
// technically we can use anything as a variable name as it's simply an alias
const db = require('../../../dbhandler');
const { DEBUG } = require('../../globals.js');

class DB extends commando.Command {
  //constructor for the class
  //is passed the bot's object as a param
  constructor(client) {
    super(client, {
      name: 'db',
      group: 'admin',
      memberName: 'db',
      description: 'loads/retrieves a given object from the db',
      //user permissions
      userPermissions: ['ADMINISTRATOR'],
      args: [
        {
          key: 'object',
          prompt: 'Handles database item entries',
          type: 'string'
        }
      ]
    });
    // binding the scope of the class instance to the following functions,
    // so that they can be passed to other objects and still be called.
    // this behavior is called using 'callbacks'
    this.logger = this.logger.bind(this);
    this.replies = this.replies.bind(this);
  }
  // this currently only outputs in the terminal the bot is running in
  // logs the data returned by a db function
  logger(data) {
    console.log(`${data}\nCode: ${data.statusCode} \nItem: `);
    console.log(data.body);
  }

  /*
  // sends data received to logger, replies with status
  data structure is that data.body is the response returned from dynamo,
  which is either an http error code or a json object.
  */
  replies(message, data, type) {
    this.logger(data);
    if (type === 'get') {
      message.reply(`got: ${data.body}`);
    }
    if (type === 'save') {
      message.reply('saved');
    }
    if (type === 'delete') {
      message.reply('deleted');
    }
  }

  // separate the arguments passed for the object
  // takes more than one argument
  cleanArguments(args) {
    // args.object = args.object.toLowerCase();
    const stringArray = args.object.split(/\s+/);
    return stringArray;
  }
  
  // the core function for the command, runs asynchronously
  async run(message, args) {
    // clean and parse the args passed
    args = this.cleanArguments(args);    
    if(args[0] === 'save') {
      // convert the third arg to a JSON object string
      args[1] = JSON.stringify(args[1]);
      // call the saveItem function from dbHandler.js,
      // sending it the dumbDynamoRoom JSON object, and an anonymous function 
      // which is later exectued as a callback
      db.saveItem(dumbDynamoRoom, 'rooms', (data) => this.replies(message, data, 'save'));
      if(!DEBUG) {
        message.delete();
      }
    } else if (args[0] === 'get') {
      // call the getItem function from dbHandler.js,
      // sending it the ID of the item we want to get
      // 2nd param is the table
      // is also sent a callback for logging purposes
      db.getItem(args[1], args[2], (data) => this.replies(message, data, 'get'));
      if(!DEBUG) {
        message.delete();
      }
    // } else if (args[0] === 'update') {
    //   db.deleteItem(args[1], args[2], (data) => this.replies(message, data, 'update'));
    //   if(!DEBUG) {
    //     message.delete();
    //   }
    } else if (args[0] === 'delete') {
      db.deleteItem(args[1], args[2], (data) => this.replies(message, data, 'delete'));
      if(!DEBUG) {
        message.delete();
      }
    } else if (args[0] === 'respawn') {
      db.saveItem(gobbie, 'entities', (data) => this.replies(message, data, 'save'));
      if(!DEBUG) {
        message.delete();
      }
    }
  }
}

//placeholder dummy data from eric's scheme
// is in the format of a JSON object, which is slightly different from a regular
// js object
const dumbDynamoRoom = {
  'name': 'room',
  'id': '532297083089321995',
  'roleid': '525358056788328448',
  'description': 'bluh bluh huge room',
  'exits': {
    'north': '520340145342513155'
  },
  'items': [

  ],
  'npcs': {
    'goblin': '0',
    'old-man': '1',
    'little-boy': '2'
  }
};

const gobbie = {
  'strength':3,
  'level':0,
  'defense':2,
  'hostile':true,
  'name':'Goblin',
  'options':{},
  'health':20,
  'description':'A green, humanoid monster stands before you with a small club in his hand.',
  'responses':{},
  'aggro':'nobody',
  'loot':[],
  'id':'0'
};

// export the class to any 'require' calls in other files
module.exports = DB;
