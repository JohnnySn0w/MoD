const { deleteMessage, bigCheck, respawn, commandPrefix } = require('../../globals.js');
const commando = require('discord.js-commando');

class Sudoku extends commando.Command {
  static commandInfo() {
    return(`Respawn player character:
    \`${commandPrefix}sudoku\``);
  }
  constructor(client) {
    super(client, {
      name: 'sudoku',
      group: 'mud',
      memberName: 'sudoku',
      description: Sudoku.commandInfo(),
    });
  }
  
  async run(message) {
    bigCheck(message, respawn.bind(this));
    deleteMessage(message);
  }
}

module.exports = Sudoku;