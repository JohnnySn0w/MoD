const Discord = require('discord.js');
const login = require('./loginCode');
const bot = new Discord.Client();

bot.login(login.key);

bot.on('message', (message) => {
	if (message.content == 'ping') {
		message.channel.send('pong');
	}
});

bot.on('message', (message) => {
	if (message.content == '👀' || message.content == '/look') {
		message.channel.send('Look what?');
	}
});

bot.on('message', (message) => {
	if (message.content == '/look room') {
		message.channel.send("you're uhhh, in a room ig \n This room is the Room of Entry");
	}
});