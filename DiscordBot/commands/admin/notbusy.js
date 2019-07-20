// importing from other files
const commando = require('discord.js-commando');
const db = require('../../utilities/dbhandler');
const { deleteMessage, sendMessage } = require('../../utilities/globals.js');

class NotBusy extends commando.Command {
  //constructor for the class
  //is passed the bot's object as a param
  constructor(client) {
    super(client, {
      name: 'notbusy',
      group: 'admin',
      ownerOnly: false,
      memberName: 'notbusy',
      description: 'Makes a player not busy',
      //user permissions
      userPermissions: ['ADMINISTRATOR'],
      args: [
        {
          key: 'playerID',
          prompt: 'Makes the given player no longer busy',
          type: 'string'
        }
      ]
    });
  }
  
  // the core function for the command, runs asynchronously
  async run(message, {playerID}) {
    db.updateItem(playerID, ['busy'], [false], 'players', ()=>{
      sendMessage(message, `<@${playerID}> is no longer busy!`);
    });
    deleteMessage(message);
  }
}

// export the class to any 'require' calls in other files
module.exports = NotBusy;
