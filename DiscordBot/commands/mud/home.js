const { bigCheck, respawn, commandPrefix } = require('../../utilities/globals');
const commando = require('discord.js-commando');
const { COMMAND_CONSTANT } = require('../../Constants/commandConstant');

class Home extends commando.Command {
  static commandInfo() {
    return(
      `Teleport player character to set home:
      \`${commandPrefix}home\``);
  }
  static aliases() { return ['hearth', 'f']; }
  constructor(client) {
    super(client, COMMAND_CONSTANT('home', Home.commandInfo(), false, Home.aliases()));
  }
  
  async run(message) {
    bigCheck(message, respawn.bind(this));
  }
}

module.exports = Home;