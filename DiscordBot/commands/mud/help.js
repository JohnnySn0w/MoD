

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
    const emojiFind = this.client.emojis.find(emoji => emoji.name === "");
    const rulebook = emojiFind ? emojiFind.toString() : ':notebook_with_decorative_cover:';
    message.message.author.send(
      `${rulebook}***MoD Commands***${rulebook}\n${this.commandDescripts()}`
    );
    deleteMessage(message);
  }
  commandDescripts() {
    let descripts = [];
    Object.keys(c).forEach((key) => {
      if (key !== 'help') {
        descripts.push(`\n**${key}**: ${c[key].commandInfo()}`) ;
      } else {
        descripts.push(`\n**${key}**: ${Help.commandInfo()}`);
      }
    });
    return descripts;
  }
}

module.exports = Help;