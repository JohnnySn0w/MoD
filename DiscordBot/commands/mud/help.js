const commando = require('discord.js-commando');
const { deleteMessage, emojiCheck, commandPrefix } = require('../../utilities/globals');
const c = require('../../utilities/commands');
const { COMMAND_CONSTANT } = require('../../Constants/commandConstant');


class Help extends commando.Command {
  static commandInfo() {
    return(
      `Displays this message
      \`${commandPrefix}help\``);
  }
  constructor(client) {
    super(client, COMMAND_CONSTANT('help', Help.commandInfo()));
  }
  
  async run(message) {
    const rulebook = emojiCheck('notebook_with_decorative_cover', this.client.emojis);
    message.message.author.send(
      `${rulebook}***MoD Commands***${rulebook}\n${this.commandDescripts()}`
    );
    deleteMessage(message);
  }
  commandDescripts() {
    let descripts = '';
    Object.keys(c).forEach((key) => {
      if (key !== 'help') {
        descripts = descripts.concat(`\n**${key}**: ${c[key].commandInfo()}`) ;
      } else {
        descripts = descripts.concat(`\n**${key}**: ${Help.commandInfo()}`);
      }
    });
    return descripts;
  }
}

module.exports = Help;