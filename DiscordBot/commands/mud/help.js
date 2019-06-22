

const commando = require('discord.js-commando');
const { deleteMessage, emojiCheck, commandPrefix } = require('../../globals.js');
const c = require('../../commands.js');


class Help extends commando.Command {
  static commandInfo() {
    return(`Displays this message\n\`${commandPrefix}help\``);
  }
  constructor(client) {
    super(client, {
      name: 'help',
      group: 'mud',
      memberName: 'help',
      description: Help.commandInfo(),
    });
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