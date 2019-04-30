const { deleteMessage } = require('../../globals.js');
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
    db.getItem(message.member.id, 'players', (data) => this.checkPlayer(message, data, args));
    deleteMessage(message);
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
      message.member.send('You\'re not in of the MUD-related rooms.');
    }
    else {
      // determine if the entity is an enemy, npc, or invalid object
      if (room.enemies[entity]) {
        db.getItem(room.enemies[entity], 'enemies', (data) => this.checkHostile(message, player, data, room));
      } else if (room.npcs[entity]) {
        message.channel.send(`${player.name} glares with murderous intent towards ${entity}.`);
      } else {
        message.channel.send(`${player.name} is feeling stabby.`);
      }
    }
  }

  checkHostile(message, player, data, room) {
    const enemy = JSON.parse(data.body).Item;

    // this is a fancy way of making sure enemy is defined
    if (enemy) {
      // make sure the player isn't busy attacking or talking to someone else already
      if (player.busy) {
        message.reply('you seem to be in the middle of something already!');
      } else {
        // make the player too busy to do anything else
        db.updateItem(player.id, ['busy'], [true], 'players', ()=>{
          console.log('Player is busy');
          this.combatLoop(message, player, enemy, room);
        });
      }
    } else if(enemy){
      message.channel.send(`${player.name} glares with murderous intent towards ${enemy.name}.`);
    } else {
      message.channel.send(`${player.name} tries to attack the air.`);
    }
  }

  cleanArgs(args) {
    // ignore the argument's capitalization
    args.object = args.object.toLowerCase();
    return args;
  }

  calculateDamage(attacker, victim, weaponMod = 0, armorMod = 0) {
    // calculate player damage on enemy and update value using weapon
    let roll = Math.floor(Math.random() * attacker.strength / 2);
    //roll is now for base damage
    let damage = roll + attacker.strength + weaponMod; 
    // subtract the victim's defense and armor from the total damage
    damage = damage - victim.defense - armorMod;
    return damage;
  }

  // lets the player make a decision per round of combat
  playerChoice(message, player, enemy, room, xp) {
    let responded = false;
    //only accepts responses in key and only from the person who started convo
    const filter = m => m.author.id === message.author.id;
    const collector = message.channel.createMessageCollector(filter, {time: 10000});
    // calculate player damage on enemy and update value
    collector.on('collect', () => {
      responded = true;
      collector.stop();
    });
    collector.on('end', m => {
      m = m.array()[0];
      if (!responded) {
        message.channel.send(`${player.name} sauntered away from ${enemy.name}, as if in a daze`);
        db.updateItem(player.id, ['health'], [player.health], 'players', () => console.log('Player health updated'));
        this.leveling(xp, player, message);
        this.postCombat(enemy, message, player, room);
      } else {
        if (m.content.includes('weapon')) {
          let damage = 0;
          if (player.inventory.weapon == null) {
            damage = this.calculateDamage(player, enemy);
          } else {
            damage = this.calculateDamage(player, enemy, player.weapon.stats);
          }
          if (damage > 0) {
            enemy.health = enemy.health - damage;
            message.channel.send(`${player.name} hit ${enemy.name} for ${damage} damage.`);
            // increment experience counter; can vary depending on the enemy later
            xp = xp + 5;
          } else {
            message.channel.send(`${player.name} swung at the ${enemy.name} and missed.`);
          }
        } else if (m.content.includes('run')){
          message.channel.send(`${player.name} ran away from ${enemy.name}`);
          db.updateItem(player.id, ['health'], [player.health], 'players', () => console.log('Player health updated'));
          this.leveling(xp, player, message);
          this.postCombat(enemy, message, player, room);
          return null;
        } else if (m.content.includes('magic')){
          message.channel.send(`${player.name} is shouting nonsense`);
        } else{
          //in the future, we can add a magic system here
          message.member.send('That ain\'t a valid attack type pardner');
          message.channel.send(`${player.name} is flailing around`);
        }
        //prevents enemy attacking if dead
        if(enemy.health > 0) {
          //calculate enemy damage and update value
          this.enemyAttack(message, player, enemy, room, xp);
        } else {
          this.leveling(xp, player, message);
          this.postCombat(enemy, message, player, room);
        }
      }
    });
  }

  enemyAttack(message, player, enemy, room, xp) {
    let damage = 0;
    if (player.inventory.armor == null) {
      damage = this.calculateDamage(enemy, player);
    } else {
      damage = this.calculateDamage(enemy, player, 0, player.armor.stats);
    }
    if (damage > 0) {
      player.health = player.health - damage;
      message.channel.send(`${player.name} was hit by the ${enemy.name} for ${damage} damage.`);
    } else {
      message.channel.send(`${enemy.name} swung at the ${player.name} and missed.`);
    }
    
    if (player.health < 1){
      this.postCombat(enemy, message, player, room);
    } else {
      this.combatLoop(message, player, enemy, room, xp);
    }
  }

  combatLoop(message, player, enemy, room, xp = 0) {
    // experience counter
    if (player.health > 0 && enemy.health > 0) {
      this.playerChoice(message, player, enemy, room, xp);
    } else {
      this.postCombat(enemy, message, player, room);
    }
  }

  postCombat(enemy, message, player, room) {
    // Player no longer busy
    db.updateItem(player.id, ['busy'], [false], 'players', () =>{});
    if(enemy.health < 1) {
      // update the player health and enemy aggro state and notify the room
      setTimeout(() => {
        message.channel.send(`${player.name} defeated the ${enemy.name}.`);
      }, 100);
      // updating player health
      db.updateItem(player.id, ['health'], [player.health], 'players', () => console.log('Player health updated'));

      // if the enemy has a respawn timer, remove its link in the room for its respawn time
      if (enemy.respawn != null) {
        delete room.enemies[enemy.name.toLowerCase()];
        db.updateItem(room.id, ['enemies'], [room.enemies], 'rooms', () => {
          setTimeout(function() {
            respawnEnemy(enemy, room);
          }, (enemy.respawn * 1000));
        });
      }
      this.rollLoot(message, player, enemy);
    } else if (player.health < 1) {
      message.channel.send(`${player.name} was defeated by a ${enemy.name}.`);
      this.respawn(player, message);
    } else {
      return null;
    }
  }

  respawn(player, message) {
    // respawn player
    db.updateItem(player.id, ['health', 'busy'], [player.maxhealth, false],'players', () => console.log('Player health restored'));
    message.member.setRoles([message.guild.roles.find(role => role.name === 'entry-room')]).catch(console.error);
    var channel = this.client.channels.find(channel => channel.name === 'entry-room');
    channel.send(`${player.name} is reborn, ready to fight again!`);
  }

  leveling(xp, player, message) {
    // leveling
    player.experience = player.experience + xp;
    if (player.experience >= player.nextLevelExperience) {
      db.updateItem(
        player.id,
        [
          'experience',
          'currentLevel',
          'nextLevelExperience',
          'strength',
          'defense'
        ],
        [
          player.experience,
          player.currentLevel + 1,
          player.nextLevelExperience + Math.floor(player.nextLevelExperience * 1.1),
          player.strength + player.currentLevel, //this gives the players factorial additions to str and def
          player.defense + player.currentLevel
        ],
        'players',
        ()=>{}
      );
      message.channel.send(`${player.name} leveled up!`);
      message.member.send(`Level up!\nYou're now at level ${player.currentLevel}.\nExperience: ${player.experience}`);
    } else {
      // adding experience without leveling
      db.updateItem(player.id, ['experience'], [player.experience], 'players', ()=>{}); 
    }
  }

  // loot functionality!
  rollLoot(message, player, enemy) {
    let possibleLoot = [];

    // perform a loot roll on every item in the enemy's loot array
    for (let lootIndex = 0; lootIndex < enemy.loot.length; lootIndex++) {
      let lootChance = Math.floor(Math.random() * 100);
      let loot = enemy.loot[lootIndex];

      // add the successfully rolled items to the possible loot array
      if (lootChance <= loot.rarity) {
        possibleLoot.push(loot);
      }
    }

    if (possibleLoot.length != 0) {
      // pick a possible loot item randomly
      let loot = possibleLoot[Math.floor(Math.random() * (possibleLoot.length-1))];
      //console.log(`Got loot! - ${JSON.stringify(loot)}`);

      // if it's gold, add it to the player's inventory direction
      if (loot.type === 'gold') {
        player.inventory.gold = player.inventory.gold + loot.amount;
        db.updateItem(player.id, ['inventory'], [player.inventory], 'players', () => {});
        message.member.send(`After defeating ${enemy.name} you picked up ${loot.amount} gold.`);
      // else, grab the item from the item table and add it to the player's inventory properly
      } else {
        db.getItem(loot.id, 'items', (data) => this.addItem(player, data, message, enemy));
      }
    } else {
      //console.log('No loot.');
      // the player won nothing
      message.member.send(`There was nothing on the ${enemy.name}'s body.`);
    }
  }

  addItem(player, data, message, enemy) {
    let item = JSON.parse(data.body).Item;
    
    // update player inventory depending on the item they got
    if (item.type === 'key')
      player.inventory.keys.push(item.name);
    else if (item.type === 'weapon')
      player.inventory.keys.push(item.name);
    else if (item.type === 'armor')
      player.inventory.keys.push(item.name);
    else {
      console.log('Item is not a grabbable.');
      return;
    }

    message.member.send(`After defeating ${enemy.name} you picked up a ${item.name}.`);

    // update db item with changes from above
    db.updateItem(player.id, ['inventory'], [player.inventory], 'players', () => {});
  }
}

function respawnEnemy(enemy, room) {
  room.enemies[enemy.name.toLowerCase()] = enemy.id;
  db.updateItem(room.id, ['enemies'], [room.enemies], 'rooms', ()=>{
    console.log(`${enemy.name} re-added`);
  });
}

module.exports = AttackCommand;
