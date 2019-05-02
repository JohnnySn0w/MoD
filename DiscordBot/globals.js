const db = require('../dbhandler');
const DEBUG = false;

function deleteMessage(message) {
// delete the user's command if not debugging
  if (!DEBUG) {
    message.delete();
  }
}

function playerCheck(data, callback, message, args) {
  let player = JSON.parse(data.body).Item;
  
  if (player === undefined) {
    message.member.send('It seems that you\'re not a part of the MUD yet! \nUse `?start` in test-zone to get started!');
  } else {
    db.getItem(message.channel.name, 'rooms', (moreData) => roomCheck(player, message, moreData, callback, args));
  }
}

function roomCheck(player, message, data, callback, args) {
  // grab the actual player object
  const room = JSON.parse(data.body).Item;

  if (room === undefined) {
    message.member.send('You are not in a MUD related room.');
  } else {
    callback(message, player, room, args);
  }
}

function bigCheck(message, callback,  args = '') {
  if(args !== '') {
    args = args.toLowerCase();
  }
  db.getItem(message.member.id, 'players', (data) => playerCheck(data, callback, message, args));
}

function respawn(message, player) {
  // respawn player
  db.updateItem(player.id, ['health', 'busy'], [player.maxhealth, false],'players', () => console.log('Player health restored'));
  message.member.setRoles([message.guild.roles.find(role => role.name === 'dead-end')]).catch(console.error);
  let channel = this.client.channels.find(channel => channel.name === 'death-notes');
  channel.send(`@everyone ${player.name} totally died lmao`);
}

module.exports = { 
  DEBUG,
  deleteMessage,
  bigCheck,
  respawn
};