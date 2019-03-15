/*
  kind of an example command
*/


// importing from other files
const commando = require('discord.js-commando');

// import the dbhandler functions, accessible by using db.whateverFunction
// technically we can use anything as a variable name as it's simply an alias
const db = require('../../../dbhandler');


class DB extends commando.Command {
  //constructor for the class
  //is passed the bot's object as a param
  constructor(client) {
    super(client, {
      name: 'db',
      group: 'mud',
      memberName: 'db',
      description: 'loads/retrieves a given object from the db',
      args: [
        {
          key: 'object',
          prompt: 'handle db item entries',
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
    console.log(data);
  }

  // sends data received to logger, replies with status
  replies(message, data, type) {
    this.logger(data);
    if (type === 'get') {
      message.reply('got:', data);
    }
    if (type === 'save') {
      message.reply('saved');
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
    } else if (args[0] === 'get') {
      // call the getItem function from dbHandler.js,
      // sending it the itemId of the item we want to get
      // is also sent a callback for logging purposes
      db.getItem(args[1], 'entities', (data) => this.replies(message, data, 'get'));
    }
  }  
}

//placeholder dummy data from eric's scheme
// is in the format of a JSON object, which is slightly different from a regular
// js object
const dumbDynamoRoom = {
  'name': 'room',
  'id': '69',
  'roleid': '3456',
  'description': 'You\'re in a large, cavernous room. Your footsteps echo into the darkness. Your journey begins to the north... \nThere\'s also an old-man and a little-boy in the room with you.',
  'exits': {
    'north': 'room-0'
  },
  'items': [

  ],
  'npcs': {
    'old-man': '1',
    'little-boy': '2'
  },
  'enemies': [

  ]
};

// export the class to any 'require' calls in other files
module.exports = DB;
