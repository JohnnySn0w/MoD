const Discord = require('discord.js');
const login = require('./loginCode');
const admin = require('./adminCommands');
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
    message.channel.send('you\'re uhhh, in a room ig \n This room is the Room of Entry');
  }
});

bot.on('message', (message) => {
  var command = /(\w)/g.exec(message);
  console.log(command);
  if (command[0] == '/look') {
    message.channel.send('looking');
  }
  if (command[0] == '/admin') {
    message.channel.send('running admin command');
  }
});