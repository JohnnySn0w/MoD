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