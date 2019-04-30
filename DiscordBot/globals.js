const db = require('../dbhandler');
const DEBUG = true;

function deleteMessage(message) {
// delete the user's command if not debugging
  if (!DEBUG) {
    message.delete();
  }
}
module.exports = { 
	DEBUG,
  deleteMessage
};

function playerCheck(args, data, callback, message) {
  let player = JSON.parse(data.body).Item;
  db.getItem(message.channel.name, 'rooms', (moreData) => roomCheck(args, player, message, moreData, callback))
}

function roomCheck(args, player, message, data, callback) {
  // grab the actual player object
  const room = JSON.parse(data.body).Item;

  if (room === undefined) {
    message.member.send('You are not in a MUD related room.');
  } else {
    callback(message, args, player, room);
  }
}

module.exports.bigCheck = (message, args, callback) => {
  args = args.toLowerCase();
  db.getItem(message.member.id, 'players', (data) => playerCheck(args, data, callback, message));
};