const commando = require('discord.js-commando');
const login = require('./loginCode');
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

console.log("Bot is running");

/*
// keeping this commented for reference for emojis later (in case we end up using them again)
client.on('message', (message) => {
	if (message.content == '👀' || message.content == '/look') {
		message.channel.send('Look what?');
	}
}); */
