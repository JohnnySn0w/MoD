const {deleteMessage} = require('../../globals.js');
const commando = require('discord.js-commando');
const db = require('../../../dbhandler');

class StatsCommand extends commando.Command {
  static commandInfo() {
    return('PMs your stats\n`?stats`');
  }
  constructor(client) {
    super(client, {
      name: 'stats',
      group: 'mud',
      memberName: 'stats',
      description: StatsCommand.commandInfo(),
    });
  }

  async run(message) {
    db.getItem(message.member.id, 'players', (data) => this.getPlayer(data, message));
    deleteMessage(message);
  }

  getPlayer(data, message) {
    // grab the actual player object
    var body = JSON.parse(data.body);
    var player = body.Item;

    if (player === undefined) {
      // if the player isn't in the database already, send them a notice that they need to "?start" the game
      message.member.send('You need to start your adventure first! Please go to the testing zone and enter the start command to proceed.');
    } else {
      // calculate the additives from weapon and armor
      var weaponMod;
      if (player.equipment.weapon == null) {
        weaponMod = '0';
      } else {
        weaponMod = player.inventory.items[player.equipment.weapon].stats;
      }

      var armorMod;
      if (player.equipment.armor == null) {
        armorMod = '0';
      } else {
        armorMod = player.inventory.items[player.equipment.armor].stats;
      }

      // otherwise, direct message the player with their health, strength, and defense
      message.member.send(`\`\`\`javascript\n${player.name}ʼs Player Stats:\nHealth: ${player.health}/${player.maxhealth}\nLevel: ${player.currentLevel}\nStrength: ${player.strength} + \(${weaponMod}\)\nDefense: ${player.defense} + \(${armorMod}\)\nCurrent Experience: ${player.experience}/${Math.floor(player.nextLevelExperience)}\n\`\`\``);
      
      // also send a warning if the player's health is low
      if (player.health > 0 && player.health < 11) {
        message.member.send('Ur gonna die');
      }
    }
  }
}
        

    

module.exports = StatsCommand;
