const commando = require('discord.js-commando');
const login = require('./loginCode');
var players = require('./schemas/players');
const db = require('../dbhandler');

const client = new commando.Client({
    commandPrefix: '?'
});

client.registry
.registerGroups([
    ['mud', 'MUD']
])
.registerDefaults()
.registerCommandsIn(__dirname + "/commands");

client.login(login.key);

db.saveItem(players);
//console.log(db.getItem(players[0].health));

console.log("Bot is running");

/*
// keeping this commented for reference for emojis later (in case we end up using them again)
client.on('message', (message) => {
	if (message.content == '👀' || message.content == '/look') {
		message.channel.send('Look what?');
	}
}); */
