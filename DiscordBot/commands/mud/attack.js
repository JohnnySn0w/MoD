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
    db.getItem(message.member.id, 'players', (data) => this.getPlayer(message, data, args));
  }

  checkPlayer(message, data, args) {
    // grab the actual room object
    var body = JSON.parse(data.body);
    var player = body.Item;

    if (player === undefined) {
      message.reply('it seems that you\'re not a part of the MUD yet! \nUse "?start" in test-zone to get started!');
    }
    else {
      // get the room object that the player is in
      db.getItem(message.channel.id, 'rooms', (data) => this.checkRoom(message, data, args, player));
    }
  }

  checkRoom(message, data, args, player) {
    var body = JSON.parse(data.body);
    var room = body.Item;

    args = this.cleanArgs(args);
    const enemy = args.object;

    //look for the npc
    if(room.npcs.enemy) {
      db.getItem(enemy, 'entities', (data) => this.combatLoop(message, player, data));
    } else {
      message.reply('glares with murderous intent towards' + args.object);
    }
  }

  cleanArgs(args) {
    // ignore the argument's capitalization
    args.object = args.object.toLowerCase();
    return args;
  }

  combatLoop(message, player, data) {
    const enemy = JSON.parse(data.body).Item;
    db.updateItem(player.id, 'busy', true, 'players', ()=>{});
    db.updateItem(enemy, 'aggro', player.id, 'entities', () => {});
    while (player.health > 0 && enemy.health > 0) {
      //calculate player damage on enemy and update value
      let damage = player.strength - enemy.defense;
      if (damage > 0) {
        db.updateItem(enemy.id, 'health', enemy.health - damage, 'entities', ()=>{});
      }
      message.reply(' hit ' + enemy.name + ' for ' + damage.toString());
      //calculate enemy damage on agro target and update value
      damage = enemy.strength - player.defense; //for the following lines replace player with agro target
      db.updateItem(player.id, 'health', player.health - damage, 'players', ()=>{});
      message.reply(' was hit by ' + enemy.name + ' for ' + damage.toString());
    }
    if(enemy.health <= 0) {
      db.updateItem(player.id, 'busy', false, 'players', ()=>{});
      message.reply('defeated the' + enemy.name);
      //TODO: loot roll here
      /* TODO: move this delete to the end of the loot roll so 
      we don't delete the enemy before distributing their loot */
      db.deleteItem(enemy.id, 'entities', ()=>{});
    }
    if (player.health <= 0) {
      db.updateItem(player.id, 'busy', false, 'players', ()=>{});
      message.reply('was defeated by a' + enemy.name);
      //TODO: revive player in starting room
    }
  }
}

module.exports = AttackCommand;
