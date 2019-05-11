const commando = require('discord.js-commando');
const { key, owner } = require('./config');
const client = new commando.Client({
  commandPrefix: '?',
  owner: owner,
});

client.registry
  .registerDefaultTypes()
  .registerGroups([
    ['mud', 'MUD'],
    ['admin', 'Admin']
  ])
  .registerDefaultGroups()
  .registerDefaultCommands({ help: false })
  .registerCommandsIn(__dirname + '/commands');

client.login(key);

console.log('Bot is running');
/*
// keeping this commented for reference for emojis later (in case we end up using them again)
client.on('message', (message) => {
	if (message.content == '👀' || message.content == '/look') {
		message.channel.send('Look what?');
	}
}); */