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
      message.member.send('It seems that you\'re not a part of the MUD yet! \nUse "?start" in test-zone to get started!');
    }
    //TODO: this should be it's own external function in globals or something
    //so we can put it on all commands without code replication
    else if (player.health <= 0) {
      message.channel.send(`${player.name} continues to be a lifeless corpse`);
      message.member.send('pls respawn to continue playing');
    } else {
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
      message.channel.send(`${player.name} glares with murderous intent towards no one in particular.`);
    }
  }

  checkHostile(message, player, data) {
    const enemy = JSON.parse(data.body).Item;
    try {
      //this is a fancy way of making sure enemy is defined
      //otherwise trying to access a key of an unef object throws a big error
      if(enemy && enemy.hostile) {
        if(enemy.aggro === 'nobody' || enemy.aggro === player.id) {
          this.combatLoop(message, player, enemy);
        } else {
          message.channel.send(`${player.name} attempts to encroach on existing combat, and fails.`);
        }
      } else if(enemy){
        message.channel.send(`${player.name} glares with murderous intent towards ${enemy.name}.`);
      } else {
        message.channel.send(`${player.name} is feeling stabby.`);
      }
    } catch (err) {
      console.log(`${err}\nThis indicates an enemy not respawning correctly or quick enough`);
      message.channel.send(`${player.name} tries to attack the air`);
    }
  }

  cleanArgs(args) {
    // ignore the argument's capitalization
    args.object = args.object.toLowerCase();
    return args;
  }

  combatLoop(message, player, enemy) {
    db.updateItem(player.id, ['busy'], [true], 'players', ()=>{});
    db.updateItem(enemy.id, ['aggro'], [player.id], 'entities', () => {});
    while (player.health > 0 && enemy.health > 0) {
      //calculate player damage on enemy and update value
      let damage = player.strength - enemy.defense;
      if (damage > 0) {
        enemy.health = enemy.health - damage;
        message.channel.send(`${player.name} hit ${enemy.name} for ${damage.toString()} damage.`);
      } else {
        message.channel.send(`${player.name} swung at the ${enemy.name} and missed.`);
      }
      //prevents enemy attacking if dead
      if(enemy.health <= 0) {
        break;
      }
      //calculate enemy damage on agro target and update value
      damage = enemy.strength - player.defense; //for the following lines replace player with agro target
      if (damage > 0) {
        player.health = player.health - damage;
        message.channel.send(`${player.name} was hit by the ${enemy.name} for ${damage.toString()} damage.`);
      } else {
        message.channel.send(`${enemy.name} swung at the ${player.name} and missed.`);
      }
    }
    console.log('updating player state');
    db.updateItem(player.id, ['health', 'busy'], [player.health, false], 'players', ()=>{});
    if(enemy.health <= 0) {
      message.channel.send(`${player.name} defeated the ${enemy.name}.`);
      //TODO: loot roll here
      /* TODO: move this delete to the end of the loot roll so 
      we don't delete the enemy before distributing their loot */
      db.deleteItem(enemy.id, 'entities', ()=>{});
    } else {
      console.log('removing aggro');
      message.channel.send(`${player.name} was defeated by a ${enemy.name}.`);
      db.updateItem(enemy.id, ['aggro'], ['nobody'], 'entities', () => {});
    }
  }
}

module.exports = AttackCommand;
