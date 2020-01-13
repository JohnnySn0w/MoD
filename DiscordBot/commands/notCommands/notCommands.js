const commando = require('discord.js-commando');
const { commandPrefix } = require('../../utilities/globals');
const { COMMAND_CONSTANT } = require('../../Constants/commandConstant');

// prevents the bot from saying a subcommand isn't a command
// like with attack or talk
class NotACommand extends commando.Command {
  static commandInfo() {
    return(
      `Displays this message
      \`${commandPrefix}help\``);
  }

  /* 
    if you have more than 13 possible options on an
    npc's dialogue state, you can push a PR to extend this.
    Or you can be /reasonable/
  */
  static aliases() {
    return ['weapon', 'magic', 'throw', 'run', 'leave',
      'cancel', 'bye', '0', '1', '2', '3', '4', '5',
      '6', '7', '8', '9', '10', '11', '12', '13'];
  }
  constructor(client) {
    super(client, COMMAND_CONSTANT(
      '',
      NotACommand.commandInfo(),
      false,
      NotACommand.aliases(),
    ));
  }
  
  async run() {
    return null;
  }
}

module.exports = NotACommand;