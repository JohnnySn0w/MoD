const {
  bigCheck,
  checkItems,
  commandPrefix,
  deleteMessage,
  discardItem,
  inventoryAddItem,
  respawn,
} = require('../../utilities/globals');
const commando = require('discord.js-commando');
const { updateItem, getItem } = require('../../utilities/dbhandler');
const  { COMMAND_CONSTANT } = require('../../Constants/commandConstant');

class AttackCommand extends commando.Command {
  static commandInfo() {
    return(
      `Attack a target
      \`${commandPrefix}attack <target>\` and then afterwards, supply a type of
      attack within 10 seconds.
      Valid keywords after successful initiation:
      \`weapon\`, \`magic\`, \`run\`, \`throw\` (throw requires an item name)`);
  }
  constructor(client) {
    super(client, COMMAND_CONSTANT('attack',  AttackCommand.commandInfo(), true));
    this.addedItem = this.addedItem.bind(this);
    this.checkHostile = this.checkHostile.bind(this);
    this.combatLoop = this.combatLoop.bind(this);
    this.getEnemy = this.getEnemy.bind(this);
    this.state = {
      message: {},
      player: {},
      room: {},
      enemy: {},
      xp: 0,
    };
  }

  async run(message, args) {
    bigCheck(message, this.getEnemy, args.object);
    deleteMessage(message);
  }

  getEnemy(message, player, room, entity) {
    this.state = { message, player, room, entity };
    if (room.enemies[entity]) {
      getItem(room.enemies[entity], 'enemies', this.checkHostile);
    } else if (room.npcs[entity]) {
      message.channel.send(`${player.characterName} glares with murderous intent towards ${entity}.`);
    } else {
      message.channel.send(`${player.characterName} is feeling stabby.`);
    }
  }

  checkHostile(data) {
    const { message, player } = this.state;
    const enemy = JSON.parse(data.body).Item;
    this.state.enemy = enemy;

    // this is a fancy way of making sure enemy is defined
    if (enemy && !enemy.despawned) {
      // make the player too busy to do anything else
      message.channel.send(`${player.characterName} has engaged ${enemy.name} in combat!`);
      updateItem(player.id, ['busy'], [true], 'players', this.combatLoop);
    } else if (enemy) {
      message.channel.send(`${player.characterName} glares with murderous intent towards ${enemy.name}.`);
    } else {
      message.channel.send(`${player.characterName} tries to attack the air.`);
    }
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
  playerChoice() {
    const { message, player, enemy } = this.state;
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
        message.channel.send(`${player.characterName} sauntered away from ${enemy.name}, as if in a daze.`);
        this.postCombat();
      } else {
        deleteMessage(m);
        m.content = m.content.toLowerCase();
        if (m.content.includes('weapon')) {
          this.playerAttack();
        } else if (m.content.includes('run')){
          this.runAway();
          return null;
        } else if (m.content.includes('magic')){
          this.magic();
        } else if (m.content.includes('throw')) {
          this.throwSomething(m.content);
        } else {
          //in the future, we can add a magic system here
          message.member.send('That ain\'t a valid attack type pardner');
          message.channel.send(`${player.characterName} is flailing around`);
        }
        //prevents enemy attacking if dead
        if(enemy.health > 0) {
          //calculate enemy damage and update value
          this.enemyAttack();
        } else {
          this.postCombat();
        }
      }
    });
  }

  runAway() {
    const { enemy, message, player } = this.state;
    message.channel.send(`${player.characterName} ran away from ${enemy.name}`);
    updateItem(player.id, ['health'], [player.health], 'players', () => {});
    this.postCombat();
  }

  throwSomething(thing) {
    const { enemy, message, player } = this.state;
    thing = thing.replace('throw ', '');
    if (thing) {
      let item = checkItems(player, thing);
      console.log(item);
      let damage;
      if (item) {
        damage = player.inventory.items[item].type === 'weapon' ? 
          player.inventory.items[item].stats : 1;
        enemy.health -= damage;
        discardItem(player, player.inventory.items[item]);
        message.channel.send(`${player.characterName} throws ${player.inventory.items[item].name} at ${enemy.name}, and hits them for ${damage} damage.`);
      }
    } else {
      message.channel.send(`${player.characterName} throws nothing at all at ${enemy.name}.`);
    }
  }

  playerAttack() {
    const { enemy, message, player } = this.state;
    // eslint-disable-next-line no-unused-vars
    let damage = 0;
    if (player.equipment.weapon == null) {
      damage = this.calculateDamage(player, enemy);
    } else {
      const weaponMod = player.inventory.items[player.equipment.weapon].stats;
      damage = this.calculateDamage(player, enemy, weaponMod);
    }
    if (damage > 0) {
      enemy.health = enemy.health - damage;
      message.channel.send(`${player.characterName} hit ${enemy.name} for ${damage} damage.`);
      if (this.state.xp === undefined) {
        this.state.xp = Math.floor(damage - (.5 * (player.currentLevel - enemy.level)));
      } else {
        this.state.xp += Math.floor(damage - (.5 * (player.currentLevel - enemy.level)));
      }
    } else {
      message.channel.send(`${player.characterName} swung at the ${enemy.name} and missed.`);
    }
  }

  magic() {
    const { message, player } = this.state;
    message.channel.send(`${player.characterName} is shouting nonsense`);
  }

  enemyAttack() {
    const { enemy, message, player } = this.state;
    let damage = 0;
    if (player.equipment.armor == null) {
      damage = this.calculateDamage(enemy, player);
    } else {
      let armorMod = player.inventory.items[player.equipment.armor].stats;
      damage = this.calculateDamage(enemy, player, 0, armorMod);
    }
    if (damage > 0) {
      player.health = player.health - damage;
      updateItem(player.id, ['health'], [player.health], 'players', () => {});
      message.channel.send(`${player.characterName} was hit by the ${enemy.name} for ${damage} damage.`);
    } else {
      message.channel.send(`${enemy.name} swung at the ${player.characterName} and missed.`);
    }
    
    if (player.health < 1){
      this.postCombat();
    } else {
      this.combatLoop();
    }
  }

  combatLoop() {
    // experience counter
    const { player, enemy } = this.state;
    if (player.health > 0 && enemy.health > 0) {
      this.playerChoice();
    } else {
      this.postCombat();
    }
  }

  postCombat() {
    const { enemy, message, player, room } = this.state;
    updateItem(player.id, ['health', 'busy'], [player.health, false], 'players', () => {});
    this.leveling();
    // Player no longer busy
    if(enemy.health < 1) {
      // update the player health and enemy aggro state and notify the room
      setTimeout(() => {
        message.channel.send(`${player.characterName} defeated the ${enemy.name}.`);
      }, 100);

      // if the enemy has a respawn timer, remove its link in the room for its respawn time
      if (enemy.respawn != null) {
        // room.enemies[enemy.name.toLowerCase()].despawned = true;
        updateItem(room.id, ['enemies'], [room.enemies], 'rooms', () => {
          setTimeout(function() {
            respawnEnemy(enemy, room);
          }, (enemy.respawn * 1000));
        });
      }
      this.rollLoot();
    } else if (player.health < 1) {
      message.channel.send(`${player.characterName} was defeated by a ${enemy.name}.`);
      bigCheck(message, respawn.bind(this));
    }
  }

  leveling() {
    const { message, player, xp } = this.state;
    if (Number.isInteger(xp)) {
      player.experience += xp;
    } else {
      return null;
    }
    if (player.experience >= player.nextLevelExperience) {
      player.maxhealth += 5;
      player.health = player.maxhealth;
      player.currentLevel += 1;
      updateItem(
        player.id,
        [
          'health',
          'maxhealth',
          'experience',
          'currentLevel',
          'nextLevelExperience',
          'strength',
          'defense'
        ],
        [
          player.health,
          player.maxhealth,
          player.experience,
          player.currentLevel,
          player.nextLevelExperience + Math.floor(player.nextLevelExperience * 1.1),
          player.strength + player.currentLevel, //this gives the players n factorial additions to str and def
          player.defense + player.currentLevel
        ],
        'players',
        ()=>{}
      ).catch(console.error);
      message.channel.send(`${player.characterName} leveled up!`);
      message.member.send(`Level up!\nYou're now at level ${player.currentLevel}.`);
    } else {
      // adding experience without leveling
      updateItem(player.id, ['experience'], [player.experience], 'players', ()=>{}); 
    }
  }

  // loot functionality!
  rollLoot() {
    const { enemy, message, player } = this.state;
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
      // if it's gold, add it to the player's inventory direction
      if (loot.type === 'gold') {
        player.inventory.gold += loot.amount;
        updateItem(player.id, ['inventory'], [player.inventory], 'players', () => {});
        message.member.send(`After defeating ${enemy.name} you picked up ${loot.amount} gold.`);
      // else, grab the item from the item table and add it to the player's inventory properly
      } else {
        getItem(loot.id, 'items', data => 
          inventoryAddItem(data, player, this.addedItem)
        );
      }
    } else {
      //console.log('No loot.');
      // the player won nothing
      message.member.send(`There was nothing on the ${enemy.name}'s body.`);
    }
  }

  addedItem(item) {
    const { enemy, message } = this.state;
    message.member.send(`After defeating ${enemy.name} you picked up a ${item.name}.`);
  }
}

function respawnEnemy(enemy, room) {
  room.enemies[enemy.name.toLowerCase()].despawned = false;
  updateItem(room.id, ['enemies'], [room.enemies], 'rooms', ()=>{
    console.log(`${enemy.name} has respawned`);
  });
}

module.exports = AttackCommand;
