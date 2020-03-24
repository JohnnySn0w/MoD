const {
  addedItem,
  bigCheck,
  checkItems,
  commandPrefix,
  deleteMessage,
  discardItem,
  inventoryAddItem,
  respawn,
  respawnEnemy,
  sendMessagePrivate,
  sendMessageRoom,
} = require('../../utilities/globals');
let { determineEffects } = require('../../utilities/globals');
const commando = require('discord.js-commando');
const { updateItem, getItem } = require('../../utilities/dbhandler');
const  { COMMAND_CONSTANT } = require('../../Constants/commandConstant');

class AttackCommand extends commando.Command {
  static commandInfo() {
    return(
      `Attack a target
      \`${commandPrefix}attack <target>\` and then afterwards, supply a type of
      attack within 20 seconds.
      Valid keywords after successful initiation:
      \`weapon\`, \`magic\`, \`run\`, \`throw\` (throw requires an item name)`);
  }
  static aliases() { return ['engage', 'accost', 'kill', 'spar', 'murder', 'maim', 'fight']; }
  constructor(client) {
    super(client, COMMAND_CONSTANT(
      'attack', 
      AttackCommand.commandInfo(),
      true,
      AttackCommand.aliases(),
    ));
    determineEffects = determineEffects.bind(this);
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
      sendMessageRoom(this.client, `${player.characterName} glares with murderous intent towards ${entity}.`, room);
    } else {
      sendMessageRoom(this.client, `${player.characterName} is feeling stabby.`, room);
    }
  }

  checkHostile(data) {
    const { message, player, room } = this.state;
    const enemy = JSON.parse(data.body).Item;
    this.state.enemy = enemy;

    // this is making sure enemy is defined
    if (enemy && !enemy.despawned) {
      // make the player too busy to do anything else
      sendMessagePrivate(message, `You are now fighting ${enemy.name}.`);
      updateItem(player.id, ['busy'], [true], 'players', this.combatLoop);
    } else if (enemy && enemy.despawned) {
      sendMessageRoom(this.client, `${player.characterName} tries to attack the air.`, room);
    } else if (enemy) {
      sendMessageRoom(this.client, `${player.characterName} glares with murderous intent towards ${enemy.name}.`, room);
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
    const { message, enemy } = this.state;
    let responded = false;
    //only accepts responses in key and only from the person who started convo
    const filter = m => m.author.id === message.author.id;
    const collector = message.channel.createMessageCollector(filter, {time: 20000});
    // calculate player damage on enemy and update value
    collector.on('collect', () => {
      responded = true;
      collector.stop();
    });
    collector.on('end', m => {
      m = m.array()[0];
      if (!responded) {
        sendMessageRoom(message, `You sauntered away from ${enemy.name}, as if in a daze.`);
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
        } else if (
          m.content.includes('throw') ||
          m.content.includes('yeet') ||
          m.content.includes('kobe')
        ) {
          this.throwSomething(m.content);
        } else if (m.content.includes('use')) {
          this.useSomething(m.content);
        } else {          
          //in the future, we can add a magic system here
          sendMessagePrivate(message, 'That ain\'t a valid attack type pardner');
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
    sendMessagePrivate(message, `You successfully run away from ${enemy.name}`);
    updateItem(player.id, ['health'], [player.health], 'players');
    this.postCombat();
  }

  throwSomething(thing) {
    const { enemy, message, player } = this.state;
    thing = thing.replace('throw ', '');
    if (thing) {
      let item = checkItems(player, thing);
      let damage;
      if (item) {
        damage = player.inventory.items[item].type === 'weapon' ? 
          player.inventory.items[item].stats : 1;
        enemy.health -= damage;
        sendMessagePrivate(message, `You throw ${player.inventory.items[item].name} at ${enemy.name}, and it hits them for ${damage} damage.`);
        discardItem(player, player.inventory.items[item]);
      }
    } else {
      sendMessagePrivate(message, `You throw nothing at all at ${enemy.name}.`);
    }
  }

  useSomething(item) {
    const { message, player } = this.state;
    item = item.replace('use ', '');
    if (item) {
      let thing = checkItems(player, item);
      if (thing) {
        getItem(thing, 'items', determineEffects);
      }
    } else {
      sendMessagePrivate(message, 'You fail to use nothing.');
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
      sendMessagePrivate(message, `You hit ${enemy.name} for ${damage} damage.`);
      if (this.state.xp === undefined) {
        this.state.xp = Math.floor(damage - (.5 * (player.currentLevel - enemy.level)));
      } else {
        this.state.xp += Math.floor(damage - (.5 * (player.currentLevel - enemy.level)));
      }
    } else {
      sendMessagePrivate(message, `You swung at the ${enemy.name} and missed.`);
    }
  }

  magic() {
    const { player, room } = this.state;
    sendMessageRoom(this.client, `${player.characterName} is shouting nonsense`, room);
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
      updateItem(player.id, ['health'], [player.health], 'players');
      sendMessagePrivate(message, `You were hit by the ${enemy.name} for ${damage} damage.`);
    } else {
      sendMessagePrivate(message, `${enemy.name} swung at you and missed.`);
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
    const { enemy, message, player } = this.state;
    updateItem(player.id, ['busy'], [false], 'players');
    this.leveling();
    // Player no longer busy
    if(enemy.health < 1) {
      // update the player health and enemy aggro state and notify the room
      setTimeout(() => {
        sendMessagePrivate(message, `You defeated the ${enemy.name}.`);
      }, 100);

      // if the enemy has a respawn timer, remove its link in the room for its respawn time
      if (enemy.respawn != null) {
        updateItem(enemy.id, ['despawned'], [true], 'enemies', () => {
          setTimeout(function() {
            respawnEnemy(enemy);
          }, (enemy.respawn * 1000));
        });
      }
      this.rollLoot();
    } else if (player.health < 1) {
      sendMessagePrivate(message, `You were defeated by a ${enemy.name}.`);
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
      sendMessagePrivate(message, `Level up!\nYou're now at level ${player.currentLevel}.`);
    } else {
      // adding experience without leveling
      updateItem(player.id, ['experience'], [player.experience], 'players'); 
    }
  }

  // loot functionality!
  rollLoot() {
    const { enemy } = this.state;
    // perform a loot roll on every item in the enemy's loot array
    for (let lootIndex = 0; lootIndex < enemy.loot.length; lootIndex++) {
      let loot = enemy.loot[lootIndex];
      // add the successfully rolled items to the possible loot array
      if (Math.floor(Math.random() * 100) <= loot.rarity) {
        this.giveLoot(loot);
      }
    }
  }

  giveLoot(loot) {
    const { enemy, player, message } = this.state;
    if (loot.type === 'gold') {
      player.inventory.gold += loot.amount;
      updateItem(player.id, ['inventory'], [player.inventory], 'players');
      sendMessagePrivate(message, `After defeating ${enemy.name} you picked up ${loot.amount} gold.`);
    // else, grab the item from the item table and add it to the player's inventory properly
    } else {
      getItem(loot.id, 'items', data => 
        inventoryAddItem(data, player, addedItem.bind(this))
      );
    }
  }
}

module.exports = AttackCommand;
