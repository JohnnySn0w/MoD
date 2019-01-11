const Discord = require('discord.js');
const commando = require('discord.js-commando');
const login = require('./loginCode');
const client = new commando.Client({
    commandPrefix: '?'
});

client.registry
.registerGroups([
    ['random', 'Random'],
    ['mud', 'MUD']
])
.registerDefaults()
.registerCommandsIn(__dirname + "/commands");

client.login(login.key);

console.log("Bot is running");

// below this line are the pre-existing methods that the bot used to parse
// messages
client.on('message', (message) => {
	if (message.content == 'ping') {
		message.channel.send('pong');
	}
});

client.on('message', (message) => {
	if (message.content == '👀' || message.content == '/look') {
		message.channel.send('Look what?');
	}
});

client.on('message', (message) => {
	if (message.content == '/look room') {
		message.channel.send("you're uhhh, in a room ig \n This room is the Room of Entry");
	}
});