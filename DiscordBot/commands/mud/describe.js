const { deleteMessage, emojiCheck, commandPrefix } = require('../../utilities/globals');
const commando = require('discord.js-commando');
const db = require('../../utilities/dbhandler');
const { COMMAND_CONSTANT } = require('../../Constants/commandConstant');

class Describe extends commando.Command {
  static commandInfo() {
    return(
      `Set your description or name.
      Usage: \`${commandPrefix}describe <"self" or "name" or "emoji"> <what you are setting it to>\`.
      A valid example would be \`${commandPrefix}describe name Atreyu\` to set your player name to Atreyu`);
  }

  static aliases() { return ['set']; }

  constructor(client) {
    super(client, COMMAND_CONSTANT(
      'describe',
      Describe.commandInfo(),
      false,
      Describe.aliases(),
    ));
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
        .catch(console.error);
      db.updateItem(message.member.id, ['characterName'], [description], 'players', ()=>{});
      break;
    default:
      message.author.send('You fail to describe that thing');
    }
  }
}

module.exports = Describe;