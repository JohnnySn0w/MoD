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

  calculateDamage(attacker, victim, roll, weaponMod = 0) {
      // calculate player damage on enemy and update value using weapon
    let damage = attacker.strength + weaponMod;
    if(roll >= 10){
      damage *= 2;
    }
    //calculate damage using enemy defense
    damage -= victim.defense;
    return damage;
  }

  combatLoop(message, player, enemy, room) {
    // commence the battle to the death
    while (player.health > 0 && enemy.health > 0) {
      let roll = Math.floor(Math.random() * 12) + 1;
      //roll 6 or higher for hit
      if(roll >= 6){
        if(player.weapon === null){
          let damage = calculateDamage(player, enemy, roll);
        } else{
          let damage = calculateDamage(player, enemy, roll, player.weapon.stats);
        }
          //make sure player isn't doing negative damage
          if(damage > 0){
            enemy.health = enemy.health - damage;
            message.channel.send(`${player.name} hit ${enemy.name} for ${damage.toString()} damage.`);
          } else{
            message.channel.send(`${player.name} did no damage to ${enemy.name}`);
          }
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
      roll = Math.floor(Math.random() * 12) + 1;

      if (roll >= 6) {
        damage = calculateDamage(enemy, player, roll)
        player.health = player.health - damage;
        message.channel.send(`${player.name} was hit by the ${enemy.name} for ${damage.toString()} damage.`);
        // health needs to update in case a player gets worried and checks their stats mid-battle
        db.updateItem(player.id, ['health'], [player.health], 'players', ()=>{console.log("Player health and busy updated")});
      } else {
        message.channel.send(`${enemy.name} swung at the ${player.name} and missed.`);
      }
    }

    if(enemy.health <= 0) {
      // update the player health and enemy aggro state and notify the room
      db.updateItem(player.id, ['health', 'busy'], [player.health, false], 'players', ()=>{console.log("Player health and busy updated")});
      message.channel.send(`${player.name} defeated the ${enemy.name}.`);

      this.rollLoot(message, player, enemy);

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
      console.log("Got loot! - " + JSON.stringify(loot));

      // if it's gold, add it to the player's inventory direction
      if (loot.type === "gold") {
        player.inventory.gold = player.inventory.gold + loot.amount;
        db.updateItem(player.id, ['inventory'], [player.inventory], 'players', () => {});
        message.member.send(`After defeating ${enemy.name} you picked up ${loot.amount} gold. It was added to your inventory.`);
      // else, grab the item from the item table and add it to the player's inventory properly
      } else {
        db.getItem(loot.id, 'items', (data) => this.addItem(player, data, message, enemy));
      }
    } else {
      console.log("No loot.");
      // the player won nothing
      message.member.send(`There was nothing on the ${enemy.name}\'s body.`);
    }
}

addItem(player, data, message, enemy) {
    let item = JSON.parse(data.body).Item;
    
    // update player inventory depending on the item they got
    if (item.type === "key")
      player.inventory.keys.push(item.name);
    else if (item.type === "weapon")
      player.inventory.keys.push(item.name);
    else if (item.type === "armor")
      player.inventory.keys.push(item.name);
    else {
      console.log("Item is not a grabbable.");
      return;
    }

    message.member.send(`After defeating ${enemy.name} you picked up a ${item.name}. It was added to your inventory.`);

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
