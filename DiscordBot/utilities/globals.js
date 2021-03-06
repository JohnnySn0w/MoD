const { getItem, updateItem } = require('./dbhandler');
const { ITEM_CONSTANT } = require('../Constants/itemConstant');

const DEBUG = true;
const emojiOn = true;
const gameWorldName = 'Mimirʼs Well';
const commandPrefix = '.';
const startingRoom = 'a-journey-begins';
const defaultDescription = 'just another person';
const defaultHearth = 'village-square';

function deleteMessage(message) {
// delete the user's command if not debugging
  if (!DEBUG && message.channel.type !== 'dm') {
    message.delete().catch(console.error);
  }
}

function emojiCheck(emojiName, emojis) {
  const emojiFind = emojis.find(emoji => emoji.name === emojiName);
  return emojiFind ? emojiFind.toString() : `:${emojiName}:`;
}

function bigCheck(message, callback,  args = '') {
  if(args !== '') {
    args = args.toLowerCase();
  }
  getItem(message.author.id, 'players', (data) => playerCheck(data, callback, message, args));
}

function playerCheck(data, callback, message, args) {
  let player = JSON.parse(data.body).Item;
  if (player === undefined) {
    message.author.send(`It seems that you're not a part of the MUD yet! \nUse \`${commandPrefix}start\` in #start-here to get started!`);
  } else if (player.busy) {
    sendMessagePrivate(message, `${player.characterName} is trying to multitask, and failing.`);
  } else if (!player.isOnline) {
    sendMessagePrivate(message, 'Please connect to play the game.');
  } else {
    getItem(player.currentRoomId, 'rooms', (moreData) => roomCheck(player, message, moreData, callback, args));
  }
}

function roomCheck(player, message, data, callback, args) {
  // grab the actual player object
  const room = JSON.parse(data.body).Item;
  callback(message, player, room, args);
}

function respawn(message, player) {
  // respawn player
  updateItem(player.id, ['health', 'busy', 'currentRoomId'], [player.maxhealth, false, player.hearth],'players');
  getItem(player.hearth, 'rooms', (data) => updateRoomPopulace(data, player, 'add'));
  sendMessagePrivate(message, `You've returned to ${player.hearth}.`);
}

function updateRoomPopulace({body}, player, type, description='') {
  const room = JSON.parse(body).Item;
  const playerItem = room.players.find(playerObj => Object.prototype.hasOwnProperty.call(playerObj, player.id));
  const index = room.players.indexOf(playerItem);
  switch (type) {
  case 'add':
    if (index > -1) {
      return null;
    } else {
      room.players.push({ [`${player.id}`]: player.characterName });
    }
    break;
  
  case 'remove':
    if (index > -1) {
      room.players.splice(index, 1);
    }
    break;

  case 'name':
    room.players[index][player.id] = description;
    break;
  }
  updateItem(room.id, ['players'], [room.players], 'rooms');
}

function checkKeys(player, itemName) {
  // iterate through the player's list of items and check each one's name
  for (let key in player.inventory.keys) {
    if (itemName === player.inventory.keys[key].name.toLowerCase()) {
      return key;
    }
  }
  return undefined;
}

function checkItems(player, itemName) {
  // iterate through the player's list of items and check each one's name
  for (let item in player.inventory.items) {
    if (itemName.toLowerCase() === player.inventory.items[item].name.toLowerCase()) {
      return player.inventory.items[item].id;
    }
  }
  return undefined;
}

function discardItem(player, item) {
  if (item.amount > 1) {
    player.inventory.items[item.id].amount -= 1;
  } else {
    delete player.inventory.items[item.id];
  }
  // update the player object and message the player
  updateItem(player.id, ['inventory', 'equipment'], [player.inventory, player.equipment], 'players', () => {});
}

function inventoryAddItem(itemData, player, callback) {
  const item = JSON.parse(itemData.body).Item;
  // if the item is a key item, add it to the player's list of keys
  if (item.type === 'key') {
    player.inventory.keys[item.id] = {
      'name': item.name,
      'used': false
    };
  // if the item is not key...
  } else {
    // check to see if the player already has that item
    if (player.inventory.items[item.id]) {
      // if so, bump the item's amount
      player.inventory.items[item.id].amount += 1;
    } else if (item.type === 'weapon' || item.type === 'armor') {
      // if not, add the item to the player's inventory
      player.inventory.items[item.id] = ITEM_CONSTANT(item, true);
    //item is a consumable and therefore not equippable
    } else {
      player.inventory.items[item.id] = ITEM_CONSTANT(item);
    }
  }
  updateItem(
    player.id,
    ['inventory'],
    [player.inventory],
    'players', () => callback(item)
  );
}

function generatePlayerList(players) {
  let list = '**Current players are**: ';
  players.forEach((player) => {
    list = list + `${player[Object.keys(player)[0]]},`;
  });
  list = list.substring(0, list.length-1);
  return list;
}

function generateRoomDescription(room) {
  let playerList;
  if (room.players.length <= 1) {
    playerList = 'There are no other players here.';
  } else 
  if (room.players.length < 4) {
    playerList = generatePlayerList(room.players);
  } else {
    playerList = 'There\'s a bit of a crowd here';
  }
  return `${room.description}\n${playerList}\n**Exits are**: ${Object.keys(room.exits).toString().replace(/,/g, ', ')}`;
}

/* 
  player specific messaging that can be triggered anywhere,
  but should only ever be sent to the player directly.
  does not use a dmOnly check for this reason
*/
function sendMessagePrivate(message, content) {
  message.author.send(content, {split: true});
}

/* 
  local area messaging
  needs an actual room object
*/
function sendMessageRoom(client, content, room) {
  room.players.forEach(playerDict => {
    const playerId = Object.keys(playerDict)[0];
    getItem(playerId, 'players', data => onlineCheck(data, client.users.cache.get(playerId), content));
  });
}

//server level messaging
function sendMessageGlobal(client, content) {
  client.users.cache.forEach(member => {
    getItem(member.id, 'players', (data) => onlineCheck(data, member, content));
  });
}

//destination should be a channel or a user
function onlineCheck({ body }, destination, content) {
  let player = JSON.parse(body).Item;

  if (player && player.isOnline) {
    destination.send(content);
    return null;
  } else {
    return null;
  }
}

// needs to have the context of 'this' bound to it wherever its called
function determineEffects(itemData) {
  const itemResolved = JSON.parse(itemData.body).Item;
  return itemResolved.effects.forEach((effect) => {
    getItem(effect, 'statusEffects', applyEffect.bind(this));
  });
}

function applyEffect(effectData) {
  // Disablement Reason: disabled because having these in context allows 
  // evals to access them
  // I'm sorry, if you have a better solution, by all means
  // eslint-disable-next-line no-unused-vars
  const { player, item } = this.state;
  const affect = JSON.parse(effectData.body).Item.effect;
  try {
    eval(affect);
  } catch(error) {
    console.error(error);
  }
}

function respawnEnemy(enemy) {
  updateItem(enemy.id, ['despawned'], [false], 'enemies', ()=>{
    console.log(`${enemy.name} has respawned`);
  });
}

function addedItem(item) {
  const { message, enemy } = this.state;
  sendMessagePrivate(message, `After defeating ${enemy.name} you picked up a ${item.name}.`);
}

module.exports = {
  addedItem,
  applyEffect,
  bigCheck,
  checkItems,
  checkKeys,
  commandPrefix,
  DEBUG,
  defaultDescription,
  defaultHearth,
  deleteMessage,
  determineEffects,
  discardItem,
  emojiCheck,
  emojiOn,
  gameWorldName,
  generateRoomDescription,
  generatePlayerList,
  inventoryAddItem,
  respawn,
  respawnEnemy,
  sendMessagePrivate,
  sendMessageRoom,
  sendMessageGlobal,
  startingRoom,
  updateRoomPopulace,
};