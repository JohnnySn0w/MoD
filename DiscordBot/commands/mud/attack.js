const { DEBUG } = require('../../globals.js');
const commando = require('discord.js-commando');
const db = require('../../../dbhandler');

// experience counter
var xp = 0;

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
    // grab the actual player object
    var player = JSON.parse(data.body).Item;

    if (player === undefined) {
      message.member.send('It seems that you\'re not a part of the MUD yet! \nUse `?start` in test-zone to get started!');
    } else {
      // get the room object that the player is in
      db.getItem(message.channel.name, 'rooms', (data) => this.checkRoom(message, data, args, player));
    }
  }

  checkRoom(message, data, args, player) {
    const room = JSON.parse(data.body).Item;
    const entity = this.cleanArgs(args).object;

    // check if the player is in a MUD-room
    if (room === undefined) {
      message.member.send("You're not in of the MUD-related rooms.");
    }
    else {
      // determine if the entity is an enemy, npc, or invalid object
      if (room.enemies[entity]) {
        db.getItem(room.enemies[entity], 'enemies', (data) => this.checkHostile(message, player, data, room));
      } else if (room.npcs[entity]) {
        message.channel.send(`${player.name} glares with murderous intent towards ${entity}.`);
      } else {
        message.channel.send(`${player.name} glares with murderous intent towards no one in particular.`);
      }
    }
  }

  cleanArgs(args) {
    // ignore the argument's capitalization
    args.object = args.object.toLowerCase();
    return args;
  }

  checkHostile(message, player, data, room) {
    const enemy = JSON.parse(data.body).Item;

    // this is a fancy way of making sure enemy is defined
    if (enemy) {
      // make sure the player isn't busy attacking or talking to someone else already
      if (player.busy) {
        message.reply(`you seem to be in the middle of something already!`);
      } else {
        // make the player too busy to do anything else
        db.updateItem(player.id, ['busy'], [true], 'players', ()=>{
          console.log("Player is busy");
          this.combatLoop(message, player, enemy, room);
        });
      }
    } else {
      message.channel.send(`${player.name} tries to attack the air.`);
    }
  }

  combatLoop(message, player, enemy, room) {
    // commence the battle to the death
    while (player.health > 0 && enemy.health > 0) {
      // calculate player damage on enemy and update value
      let damage = player.strength - enemy.defense;
      if (damage > 0) {
        enemy.health = enemy.health - damage;
        message.channel.send(`${player.name} hit ${enemy.name} for ${damage.toString()} damage.`);
        // increment experience counter; can vary depending on the enemy later
        xp = xp + 5;
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

    if(enemy.health <= 0) {
      // update the player health and enemy aggro state and notify the room
      db.updateItem(player.id, ['health', 'busy'], [player.health, false], 'players', ()=>{console.log("Player health and busy updated")});
      message.channel.send(`${player.name} defeated the ${enemy.name}.`);

      //TODO: loot roll here
      /* TODO: move this delete to the end of the loot roll so 
      we don't delete the enemy before distributing their loot */

      // if the enemy has a respawn timer, remove its link in the room for its respawn time
      if (enemy.respawn != null) {
        delete room.enemies[enemy.name.toLowerCase()];
        db.updateItem(room.id, ['enemies'], [room.enemies], 'rooms', ()=>{
          setTimeout(function() {
            respawnEnemy(enemy, room)
          }, (enemy.respawn * 1000));
        });
      }
    } else {
      message.channel.send(`${player.name} was defeated by a ${enemy.name}.`);

      // respawn player
      db.updateItem(player.id, ['health', 'busy'], [player.maxhealth, false],'players', () => {console.log("Player health restored")});
      message.member.setRoles([message.guild.roles.find(role => role.name === "entry-room")]).catch(console.error);
      var channel = this.client.channels.find(channel => channel.name === "entry-room");
      channel.send(`${player.name} is reborn, ready to fight again!`);
    }

    // adding experience
    player.experience = player.experience + xp;
    db.updateItem(player.id, ['experience'], [player.experience], 'players', ()=>{}); // add xp to player's experience
    xp = 0; // reset xp to 0    

    // leveling
    if (player.experience >= player.nextLevelExperience) {
      db.updateItem(
        player.id,
        [
          'currentLevel',
          'nextLevelExperience',
          'strength',
          'defense'
        ],
        [
          player.currentLevel = player.currentLevel + 1,
          player.currentLevel + (player.nextLevelExperience * player.currentLevel),
          player.strength + player.currentLevel,
          player.defense + player.currentLevel
        ],
        'players',
        ()=>{}
      );
      message.channel.send(`${player.name} leveled up!`);
      message.member.send(`Level up!\nYou're now at level ${player.currentLevel}.\nExperience: ${player.experience}`);
    }
  }
}

function respawnEnemy(enemy, room) {
  room.enemies[enemy.name.toLowerCase()] = enemy.id;
  db.updateItem(room.id, ['enemies'], [room.enemies], 'rooms', ()=>{
    console.log(`${enemy.name} re-added`);
  });
}

module.exports = AttackCommand;
