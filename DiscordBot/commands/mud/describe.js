const { deleteMessage, emojiCheck, commandPrefix } = require('../../globals.js');
const commando = require('discord.js-commando');
const db = require('../../../dbhandler');

class Describe extends commando.Command {
  static commandInfo() {
    return(`Set your description or name.\nUsage: \`${commandPrefix}describe <"self" or "name" or "emoji"> <what you are setting it to>\`.\nA valid example would be \`${commandPrefix}describe name Atreyu\` to set your player name to Atreyu`);
  }
  constructor(client) {
    super(client, {
      name: 'describe',
      group: 'mud',
      memberName: 'describe',
      description: Describe.commandInfo(),
    });
  }
  
  async run(message, args) {
    const arguements = /\w+\s/.exec(args);
    const type = arguements[0].replace(/\s/, '');
    const description = arguements.input.replace(arguements[0],'');

    this.determineDescribeType(message, type, description);
    deleteMessage(message);
  }

  determineDescribeType(message, type, description) {
    switch (type) {
    case 'emoji':
      emojiCheck(description, message.channel.guild.emojis);
      db.updateItem(message.member.id, ['emoji'], [description], 'players', () => {});
      break;
    case 'self':
      db.updateItem(message.member.id, ['description'], [description], 'players', () => {});
      break;
    case 'name':
      if (description.length > 32) {
        break;
      }
      message.member.setNickname(description)
        .then(console.log)
        .catch(console.error);
      db.updateItem(message.member.id, ['characterName'], [description], 'players', ()=>{});
      break;
    default:
      message.author.send('You fail to describe that thing');
    }
  }
}

module.exports = Describe;