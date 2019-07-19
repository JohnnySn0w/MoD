const db = require('./dbhandler');
const { ITEM_CONSTANT } = require('../Constants/itemConstant');

const DEBUG = true;
const emojiOn = true;
const gameWorldName = 'Mimirʼs Well';
const commandPrefix = '.';
const dmOnly = true;

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
  if (!dmOnly) {
    if (message.message.channel.type === 'dm') {
      message.author.send('You are not in a MUD related room.');
      return null;
    }
  }
  if(args !== '') {
    args = args.toLowerCase();
  }
  db.getItem(message.author.id, 'players', (data) => playerCheck(data, callback, message, args));
}

function playerCheck(data, callback, message, args) {
  let player = JSON.parse(data.body).Item;
  
  if (player === undefined) {
    message.member.send('It seems that you\'re not a part of the MUD yet! \nUse `${commandPrefix}start` in #start-here to get started!');
  } else if (player.busy) {
    message.channel.send(`${player.characterName} is trying to multitask, and failing.`);
  } else {
    db.getItem(message.channel.name, 'rooms', (moreData) => roomCheck(player, message, moreData, callback, args));
  }
}

function roomCheck(player, message, data, callback, args) {
  // grab the actual player object
  const room = JSON.parse(data.body).Item;

  if (!dmOnly) {
    if (room === undefined) {
      message.author.send('You are not in a MUD related room.');
    }
  } else {
    callback(message, player, room, args);
  }
}

function respawn(message, player) {
  // respawn player
  db.updateItem(player.id, ['health', 'busy', 'currentRoomId'], [player.maxhealth, false, player.hearth],'players', () => {});
  message.member.setRoles([message.guild.roles.find(role => role.name === 'village-square')]).catch(console.error);
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
  db.updateItem(player.id, ['inventory', 'equipment'], [player.inventory, player.equipment], 'players', () => {});
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
  db.updateItem(
    player.id,
    ['inventory'],
    [player.inventory],
    'players', () => callback(item)
  );
}

//player specific messaging
function sendMessage(message, content) {
  if (dmOnly) {
    message.author.send(content);
  } else {
    message.reply(content);
  }
}

/* 
  player specific messaging that can be triggered anywhere,
  but should only ever be sent to the player directly.
  does not use a dmOnly check for this reason
*/
function sendMessagePrivate(message, content) {
  message.author.send(content);
}

//local area messaging
function sendMessageRoom(message, content) {
  message.channel.members.forEach(member => {

    member.send(content);
  });
  message.reply();
  //need some wierd lookup to find player room
}

function onlineCheck({ body }, member, content) {
  let player = JSON.parse(body).Item;
  
  if (player && player.online) {
    member.send(content);
  } else {
    return null;
  }
}

//server level messaging
function sendMessageGlobal(message, content) {
  message.guild.fetchMembers().forEach(member => {
    db.getItem(member.id, 'players', (data) => onlineCheck(data, member, content) );
  });
  if (!dmOnly) {
    message.guild.channels.forEach(channel => {
      if (channel.type === 'text') {
        channel.send(content);
      }
    });
  }
}

module.exports = {
  bigCheck,
  checkItems,
  checkKeys,
  commandPrefix,
  DEBUG,
  deleteMessage,
  discardItem,
  emojiCheck,
  emojiOn,
  gameWorldName,
  inventoryAddItem,
  respawn,
  sendMessage,
  sendMessagePrivate,
  sendMessageRoom,
  sendMessageGlobal
};