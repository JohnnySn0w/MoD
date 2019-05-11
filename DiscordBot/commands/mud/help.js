

const commando = require('discord.js-commando');
const { deleteMessage } = require('../../globals.js');
const c = require('../../commands.js');


class Help extends commando.Command {
  static commandInfo() {
    return('Displays this message\n`?help`');
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
    message.message.author.send(
      this.commandDescripts()
    );
    deleteMessage(message);
  }
  commandDescripts() {
    let descripts = [];
    Object.keys(c).forEach((key) => {
      if (key !== 'help') {
        descripts.push(`**${key}**: ${c[key].commandInfo()}`) ;
      } else {
        descripts.push(`**${key}**: ${Help.commandInfo()}`);
      }
    });
    descripts.push('***bot commands should be send in game and not directly to the bot***');
    return descripts;
  }
}

module.exports = Help;