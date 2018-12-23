console.log("Hello World!");

const Discord = require('discord.js');
const bot = new Discord.Client();

bot.login('NTI1MzU1Nzk5OTI1NzUxODQ4.Dv2SKA.SH6V4uNcU4XQ01o6lYyeerNq8Sw');

bot.on('message', (message) => {
    if (message.content == 'ping') {
        // message.reply('pong');
        message.channel.send("pong");
    }
});