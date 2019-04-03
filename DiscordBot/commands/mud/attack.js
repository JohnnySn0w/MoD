const { DEBUG } = require('../../globals.js');
const commando = require('discord.js-commando');
const db = require('../../../dbhandler');

class AttackCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'attack',
      group: 'mud',
      memberName: 'attack',
      description: 'Handles combat',
      args: [
        {
          key: 'object',
          prompt: 'What are you trying to attack?',
          type: 'string'
        }
      ]
    });
  }

  async run(message, args) {
    // delete the user's command if not debugging
    if (!DEBUG) {
      message.delete();
    }
    db.getItem(message.member.id, 'players', (data) => this.checkPlayer(message, data, args));
  }

  checkPlayer(message, data, args) {
    // grab the actual room object
    var player = JSON.parse(data.body).Item;

    if (player === undefined) {
      message.reply('it seems that you\'re not a part of the MUD yet! \nUse "?start" in test-zone to get started!');
    }
    else {
      // get the room object that the player is in
      db.getItem(message.channel.id, 'rooms', (data) => this.checkRoom(message, data, args, player));
    }
  }

  checkRoom(message, data, args, player) {
    const room = JSON.parse(data.body).Item;
    const enemy = this.cleanArgs(args).object;
    //look for the npc
    if(room.npcs[enemy]) {
      db.getItem(room.npcs[enemy], 'entities', (data) => this.checkHostile(message, player, data));
    } else {
      message.reply(' glares with murderous intent towards no one in particular');
    }
  }

  checkHostile(message, player, data) {
    const enemy = JSON.parse(data.body).Item;
    console.log(data.body);
    if(enemy.hostile){
      if(enemy.aggro === '0') {
        this.combatLoop(message, player, enemy);
      } else {
        message.reply(` ${enemy.aggro} else is already fighting that target!`);
      }
    }
    message.reply(' glares with murderous intent towards ' + enemy.name);
  }

  cleanArgs(args) {
    // ignore the argument's capitalization
    args.object = args.object.toLowerCase();
    return args;
  }

  combatLoop(message, player, enemy) {
    db.updateItem(player.id, 'busy', true, 'players', ()=>{});
    db.updateItem(enemy.id, 'aggro', player.id, 'entities', () => {});
    while (player.health > 0 && enemy.health > 0) {
      //calculate player damage on enemy and update value
      let damage = player.strength - enemy.defense;
      if (damage > 0) {
        enemy.health = enemy.health - damage;
        message.reply(` hit ${enemy.name} for ${damage.toString()} damage.`);
      } else {
        message.reply(` swung at the ${enemy.name} and missed.`);
      }
      //calculate enemy damage on agro target and update value
      damage = enemy.strength - player.defense; //for the following lines replace player with agro target
      if (damage > 0) {
        player.health = player.health - damage;
        message.reply(` was hit by ${enemy.name} for ${damage.toString()} damage.`);
      } else {
        message.reply(` ${enemy.name} swung at ${player.name} and missed.`);
      }
    }
    db.updateItem(player.id, 'health', player.health, 'players', ()=>{});
    db.updateItem(player.id, 'busy', false, 'players', ()=>{});
    if(enemy.health <= 0) {
      message.reply(`defeated the ${enemy.name}.`);
      //TODO: loot roll here
      /* TODO: move this delete to the end of the loot roll so 
      we don't delete the enemy before distributing their loot */
      db.deleteItem(enemy.id, 'entities', ()=>{});
    } else {
      db.updateItem(enemy.id, 'aggro', '0', 'entities', () => {});
    }
    if (player.health <= 0) {
      message.reply('was defeated by a' + enemy.name);
      //TODO: revive player in starting room
    }
  }
}

module.exports = AttackCommand;
