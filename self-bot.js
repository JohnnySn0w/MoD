/*
    the regression test self-bot that will
    perform a "run-through" of the MUD so far
    it will attempt to make sure all of the commands still work as intended 
    by executing teh commands and checking the responses
*/


// i think i want to set all the channel IDs as a const to check and make sure the moves worked

const discord = require("discord.js");
 
const TOKEN = ""; // still need to find my token
 
const bot = new discord.Client();
 
bot.on("ready",()=>{
    console.log("Ready!");
    var server = bot.guilds.find("id","")
    var chan = new discord.TextChannel(server,{"id":""});
//get to channel Test Zone
// execute ?stats
// expect respose :"you need to start your adventure first!"
    var chan_entry = client.channels.get("id")
// execute ?start
// expected response :"Welcome to the MUD!:"

// execute ?stats
// expect: 

// move to room-0
// ?look
// expected response "look at what?"
// room
// "blah blah room description"

// ?look room
// "blah blah room description"

// ?look old-man
// expected response: "old-man description"

// ?look little-boy
// expected response: "little-boy description"

// ?talk old-man
// expected response: "old-man response"

// ?talk-little-boy
// expected response: "little boy response"

// move wrong direction
// expected response: "no movement in __ direction"

// move next room

// look room
// look ladder

// move ladder

// look room
//move ladder
// expected: "no movement in the ladder direction"

//move up

// look room


})
 
bot.login(TOKEN);