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
    // grab the actual room object
    var player = JSON.parse(data.body).Item;

    if (player === undefined) {
      message.member.send('It seems that you\'re not a part of the MUD yet! \nUse `?start` in test-zone to get started!');
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
    console.log('updating player state');
    db.updateItem(player.id, ['health', 'busy'], [player.health, false], 'players', ()=>{});
    if(enemy.health <= 0) {
      message.channel.send(`${player.name} defeated the ${enemy.name}.`);      

      //TODO: loot roll here
      this.rollLoot(message, player, enemy);
      //message.member.send('After defeating ', ${enemy.name}, ', you can loot', ' placeholder loot string');
      /* TODO: move this delete to the end of the loot roll so 
      we don't delete the enemy before distributing their loot */
      db.deleteItem(enemy.id, 'entities', ()=>{});
    } else {
      console.log('removing aggro');
      message.channel.send(`${player.name} was defeated by a ${enemy.name}.`);
      db.updateItem(enemy.id, ['aggro'], ['nobody'], 'entities', () => {});
    }

    // adding experience
    db.updateItem(player.id, ['experience'], [player.experience + xp], 'players', ()=>{}); // add xp to player's experience
    xp = 0; // reset xp to 0    

    // leveling
    if (player.experience >= player.nextLevel) {
      db.updateItem(player.id, ['level'], [player.level = player.level + 1], 'players', ()=>{});
      db.updateItem(player.id, ['nextLevel'], [player.nextLevel + (player.nextLevel * player.level)], 'players', ()=>{});
      db.updateItem(player.id, ['strength'], [player.strength + player.level], 'players', ()=>{});
      db.updateItem(player.id, ['defense'], [player.defense + player.level], 'players', ()=>{});
      message.channel.send(`${player.name} leveled up!`);
      message.member.send("Level up!\n You're now at level " + player.level + ".\n" + "Experience: " + player.experience);
    }

  }
  rollLoot(message, player, enemy) {
    loot_num = Math.floor(Math.random() * 5) + 1 ; // generating a random number between 1 and 5 for loot drop
      switch(loot_num) {
        case 1: // need to add response check for if the player wants to pickup the item or not
          message.member.send(`After defeating  ${enemy.name} you can loot placeholder loot string for sword.`);
          message.member.send(`[0] Pick up sword`);  // need to add these items to the item schema so they can be tangible
          if(message.content === '0'){
            message.member.send(`You have picked up the sword. Added to your inventory`); // inventory needs to be implemented before this will actually work
          }
          else{
            message.member.send(`You decide to leave the item on teh ground. what need have you for it anyway?`)
          }
        case 2:
          message.member.send(`After defeating ${enemy.name} you can loot placeholder loot string for shield`);
          message.member.send('[0] Pick up shield')
          if(message.content === '0'){
            message.member.send(`You have picked up the shield. Added to your inventory`);
          }
          else{
            message.member.send(`You decide to leave the item on teh ground. what need have you for it anyway?`)
          }
        case 2:
          message.member.send(`After defeating ${enemy.name} you can loot placeholder loot string for health potion`);
          message.member.send(`[0] Pick uphealth potion`);  // need to add these items to the item schema so they can be tangible
          if(message.content === '0'){
            message.member.send(`You have picked up the sword. Added to your inventory`)
          }
          else{
            message.member.send(`You decide to leave the item on teh ground. what need have you for it anyway?`)
          }
        case 3:
          message.member.send(`After defeating ${enemy.name} you can loot placeholder loot string for 10 gold`);
          message.member.send(`[0] Pick up 10 gold`);  // need to add these items to the item schema so they can be tangible
          if(message.content === '0'){
            message.member.send(`You have picked up the 10 gold. Added to your inventory`)
          }
          else{
            message.member.send(`You decide to leave the item on teh ground. what need have you for it anyway?`)
          }
        case 4:
          message.member.send(`After defeating ${enemy.name} you can loot placeholder loot string for 50 gold`);
          message.member.send(`[0] Pick up 50 gold`);  // need to add these items to the item schema so they can be tangible
          if(message.content === '0'){
            message.member.send(`You have picked up the 50 gold. Added to your inventory`)
          }
          else{
            message.member.send(`You decide to leave the item on teh ground. what need have you for it anyway?`)
          }

        default:
          message.member.send(`After defeating ${enemy.name} you find that it did not drop any loot. How unfortunate.`);
      }
    }
  
}

module.exports = AttackCommand;
