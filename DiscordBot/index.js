/* eslint-disable no-console */
const commando = require('discord.js-commando');
const { key, owner } = require('./config');
const { commandPrefix } = require('./utilities/globals');
const client = new commando.Client({
  commandPrefix: commandPrefix,
  owner: owner,
});

client.registry
  .registerDefaultTypes()
  .registerGroups([
    ['mud', 'MUD'],
    ['admin', 'Admin']
  ])
  .registerDefaultGroups()
  .registerDefaultCommands({ help: false, eval: false })
  .registerCommandsIn(__dirname + '/commands');

client.login(key);

console.log('Bot is running');