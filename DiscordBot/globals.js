const db = require('../dbhandler');
const DEBUG = false;
const emojiOn = true;
const gameWorldName = 'game channels';
const commandPrefix = '.';

function deleteMessage(message) {
// delete the user's command if not debugging
  if (message.channel.type !== 'dm') {
    if (!DEBUG) {
      message.delete().catch(console.error);
    }
  }
}

function emojiCheck(emojiName, emojis) {
  const emojiFind = emojis.find(emoji => emoji.name === emojiName);
  return emojiFind ? emojiFind.toString() : `:${emojiName}:`;
}

function bigCheck(message, callback,  args = '') {
  if (message.message.channel.type === 'dm') {
    message.author.send('You are not in a MUD related room.');
    return null;
  }
  if(args !== '') {
    args = args.toLowerCase();
  }
  db.getItem(message.author.id, 'players', (data) => playerCheck(data, callback, message, args));
}

function playerCheck(data, callback, message, args) {
  let player = JSON.parse(data.body).Item;
  
  if (player === undefined) {
    message.member.send('It seems that you\'re not a part of the MUD yet! \nUse `?start` in #start-here to get started!');
  } else {
    db.getItem(message.channel.name, 'rooms', (moreData) => roomCheck(player, message, moreData, callback, args));
  }
}

function roomCheck(player, message, data, callback, args) {
  // grab the actual player object
  const room = JSON.parse(data.body).Item;

  if (room === undefined) {
    message.author.send('You are not in a MUD related room.');
  } else {
    callback(message, player, room, args);
  }
}

function respawn(message, player) {
  // respawn player
  db.updateItem(player.id, ['health', 'busy'], [player.maxhealth, false],'players', () => console.log('Player health restored'));
  message.member.setRoles([message.guild.roles.find(role => role.name === 'dead-end')]).catch(console.error);
  let channel = this.client.channels.find(channel => channel.name === 'death-notes');
  channel.send(`${player.characterName} totally died lmao`);
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
  for (var item in player.inventory.items) {
    if (itemName === player.inventory.items[item].name.toLowerCase()) {
      return player.inventory.items[item].id;
    }
  }

  return undefined;
}

module.exports = { 
  bigCheck,
  checkItems,
  checkKeys,
  commandPrefix,
  DEBUG,
  deleteMessage,
  emojiCheck,
  emojiOn,
  gameWorldName,
  respawn
};