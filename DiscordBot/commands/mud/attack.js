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
      db.getItem(message.channel.id, 'rooms', (data) => this.checkRoom(message, data, args, player));
    }
  }

  checkRoom(message, data, args, player) {
    const room = JSON.parse(data.body).Item;
    const entity = this.cleanArgs(args).object;
    //look for the npc
    if (room === undefined) {
      message.member.send("You're not in of the MUD-related rooms.");
    }
    else {
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
    //this is a fancy way of making sure enemy is defined
    //otherwise trying to access a key of an unef object throws a big error
    console.log("Goblin = " + JSON.stringify(enemy));
    if (enemy) {
      if (enemy.aggro === 'nobody' || enemy.aggro === player.id) {
        this.combatLoop(message, player, enemy, room);
      } else if (enemy.aggro === player.id) {
        message.reply(`you're already fighting the ${enemy.name}!`);
      } else {
        message.channel.send(`${player.name} attempts to encroach on existing combat, and fails.`);
      }
    } else {
      message.channel.send(`${player.name} tries to attack the air.`);
    }
  }

  combatLoop(message, player, enemy, room) {
    db.updateItem(player.id, ['busy'], [true], 'players', ()=>{});
    db.updateItem(enemy.id, ['aggro'], [player.id], 'enemies', () => {});
    console.log("Player health - " + player.health);

    while (player.health > 0 && enemy.health > 0) {
      //calculate player damage on enemy and update value
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
      db.updateItem(player.id, ['health', 'busy'], [player.health, false], 'players', ()=>{console.log("Player health updated")});
      db.updateItem(enemy.id, ['aggro'], ['nobody'], 'enemies', ()=>{console.log("Enemy aggro updated")});
      message.channel.send(`${player.name} defeated the ${enemy.name}.`);

      //TODO: loot roll here
      this.rollLoot(message, player, enemy);
      message.member.send('After defeating ' + `${enemy.name}`+ ', you can loot' + ' placeholder loot string');
      /* TODO: move this delete to the end of the loot roll so 
      we don't delete the enemy before distributing their loot */

<<<<<<< HEAD
      // remove the enemy from the list of entities in the room and then re-add it after 30 seconds
=======
      // remove the enemy from the list of enemies in the room and then re-add it after 10 seconds
      console.log("Enemy name = " + enemy.name.toLowerCase());
      delete room.enemies[enemy.name.toLowerCase()];
      db.updateItem(room.id, ['enemies'], [room.enemies], 'rooms', ()=>{
        console.log("Removed enemy from room - " + JSON.stringify(room.enemies));
        setTimeout(function() {
          respawnEnemy(enemy, room)
        }, 30000);
      });
    } else {
      message.channel.send(`${player.name} was defeated by a ${enemy.name}.`);
      db.updateItem(enemy.id, ['aggro'], ['nobody'], 'enemies', () => {});

      // respawn player
      db.updateItem(player.id, ['health'], [player.maxhealth],'players', () => {console.log("Player health restored")});
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
      db.updateItem(player.id, ['currentLevel'], [player.currentLevel = player.currentLevel + 1], 'players', ()=>{});
      db.updateItem(player.id, ['nextLevelExperience'], [player.currentLevel + (player.nextLevelExperience * player.currentLevel)], 'players', ()=>{});
      db.updateItem(player.id, ['strength'], [player.strength + player.currentLevel], 'players', ()=>{});
      db.updateItem(player.id, ['defense'], [player.defense + player.currentLevel], 'players', ()=>{});
      message.channel.send(`${player.name} leveled up!`);
      message.member.send("Level up!\n You're now at level " + player.currentLevel + ".\n" + "Experience: " + player.experience);
    }

  }
  rollLoot(message, player, enemy) {
    var loot_num = Math.floor(Math.random() * 5) + 1 ; // generating a random number between 1 and 5 for loot drop
      switch(loot_num) {
        case 1: // need to add response check for if the player wants to pickup the item or not
          message.member.send(`After defeating  ${enemy.name} you can loot placeholder loot string for sword.`);
          message.member.send(`[0] Pick up sword`);  // need to add these items to the item schema so they can be tangible
          if(message.content === '0'){
            message.member.send(`You have picked up the sword. Added to your inventory`); // inventory needs to be implemented before this will actually work
            db.updateItem(player.id, ['weapon'], ['basic-ass sword'], 'players', ()=>{}); // theoretically, this will add the basic sword to your weapon slot
          }
          else{
            message.member.send(`You decide to leave the item on teh ground. what need have you for it anyway?`)
          }
        case 2:
          message.member.send(`After defeating ${enemy.name} you can loot placeholder loot string for shield`);
          message.member.send('[0] Pick up shield')
          if(message.content === '0'){
            message.member.send(`You have picked up the shield. Added to your inventory`);
            db.updateItem(player.id, ['equipment'], ['dinky shield'], 'players', ()=>{}); // theoretically, this will add the dinky shield to your weapon slot
          }
          else{
            message.member.send(`You decide to leave the item on teh ground. what need have you for it anyway?`)
          }
        case 3:
          message.member.send(`After defeating ${enemy.name} you can loot placeholder loot string for health potion`);
          message.member.send(`[0] Pick uphealth potion`);  // need to add these items to the item schema so they can be tangible
          if(message.content === '0'){
            message.member.send(`You have picked up the sword. Added to your inventory`)
            db.updateItem(player.id, ['inventory'], ['small health potion'], 'players', ()=>{}); // theoretically, this will add to your inventory
          }
          else{
            message.member.send(`You decide to leave the item on teh ground. what need have you for it anyway?`)
          }
        case 4:
          message.member.send(`After defeating ${enemy.name} you can loot placeholder loot string for 10 gold`);
          message.member.send(`[0] Pick up 10 gold`);  // need to add these items to the item schema so they can be tangible
          if(message.content === '0'){
            message.member.send(`You have picked up the 10 gold. Added to your inventory`)
            db.updateItem(player.id, ['gold'], [player.gold = player.gold + 10], 'players', ()=>{}); // theoretically, this will add some gold to your bank account
          }
          else{
            message.member.send(`You decide to leave the item on teh ground. what need have you for it anyway?`)
          }
        case 5:
          message.member.send(`After defeating ${enemy.name} you can loot placeholder loot string for 50 gold`);
          message.member.send(`[0] Pick up 50 gold`);  // need to add these items to the item schema so they can be tangible
          if(message.content === '0'){
            message.member.send(`You have picked up the 50 gold. Added to your inventory`)
            db.updateItem(player.id, ['gold'], [player.gold = player.gold + 50], 'players', ()=>{}); // theoretically, this will add some gold to your bank account
          }
          else{
            message.member.send(`You decide to leave the item on teh ground. what need have you for it anyway?`)
          }

        default:
          message.member.send(`After defeating ${enemy.name} you find that it did not drop any loot. How unfortunate.`);
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
