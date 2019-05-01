const {deleteMessage, bigCheck, respawn} = require('../../globals.js');
const commando = require('discord.js-commando');

class Sudoku extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'sudoku',
      group: 'mud',
      memberName: 'sudoku',
      description: '`respawn`'
    });
  }
  
  async run(message) {
    bigCheck(message, respawn.bind(this));
    deleteMessage(message);
  }
}

module.exports = Sudoku;