const { deleteMessage, bigCheck, respawn, commandPrefix } = require('../../globals.js');
const commando = require('discord.js-commando');
const { COMMAND_CONSTANT } = require('../../Constants/commandConstant');

class Sudoku extends commando.Command {
  static commandInfo() {
    return(
      `Respawn player character:
      \`${commandPrefix}sudoku\``);
  }
  constructor(client) {
    super(client, COMMAND_CONSTANT('sudoku', Sudoku.commandInfo()));
  }
  
  async run(message) {
    bigCheck(message, respawn.bind(this));
    deleteMessage(message);
  }
}

module.exports = Sudoku;