const commando = require('discord.js-commando');
const { deleteMessage, emojiCheck, commandPrefix, sendMessagePrivate } = require('../../utilities/globals');
const c = require('../../utilities/commands');
const { COMMAND_CONSTANT } = require('../../Constants/commandConstant');


class Help extends commando.Command {
  static commandInfo() {
    return(
      `Displays this message
      \`${commandPrefix}help\``);
  }
  static aliases() { return ['commands', 'list', 'h']; }
  constructor(client) {
    super(client, COMMAND_CONSTANT(
      'help',
      Help.commandInfo(),
      false,
      Help.aliases(),
    ));
  }
  
  async run({message}) {
    const rulebook = emojiCheck('notebook_with_decorative_cover', this.client.emojis);
    sendMessagePrivate(message, 
      `${rulebook}***MoD Commands***${rulebook}\n${this.commandDescripts()}`
    );
    deleteMessage(message);
  }

  commandDescripts() {
    let descripts = '';
    Object.keys(c).forEach((key) => {
      if (key !== 'help') {
        descripts = descripts.concat(`__${key}__ – synonyms: *${c[key].aliases()}*\n\t${c[key].commandInfo()}\n\n`) ;
      } else {
        descripts = descripts.concat(`__${key}__ – synonyms: *${Help.aliases()}*\n\t${Help.commandInfo()}\n\n`);
      }
    });
    return descripts;
  }
}

module.exports = Help;