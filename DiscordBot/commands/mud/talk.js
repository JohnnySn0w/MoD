const {DEBUG} = require('../../globals.js');
const commando = require('discord.js-commando');
const db = require('../../../dbhandler');

class TalkCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'talk',
      group: 'mud',
      memberName: 'talk',
      description: 'Allows users to interact with NPCs',
      args: [
        {
          key: 'person',
          prompt: 'Who are you talking to?',
          type: 'string'
        }
      ]
    });
  }

  async run(message, args) {
    // get the player object so that we know the player's progress with this NPC
    db.getItem(message.member.id, 'players', (data) => this.getPlayer(message, args, data));
    // delete the user's command if not debugging
    if (!DEBUG){
      message.delete();
    }
  }

  getPlayer(message, args, data) {
    // grab the actual player object
    let body = JSON.parse(data.body);
    let player = body.Item;

    if (player === undefined) {
      // if we couldn't find the player, they haven't started yet
      message.member.send('it seems that you\'re not a part of the MUD yet! \nUse "?start" in test-zone to get started!');
    }
    else {
      // otherwise, get the room object that the player is in
      db.getItem(message.channel.id, 'rooms', (data) => this.getRoom(message, args, player, data));
    }
  }

  getRoom(message, args, player, data) {
    // grab the actual player object
    const body = JSON.parse(data.body);
    const room = body.Item;

    args = this.cleanArgs(args);

    if (room === undefined) {
      message.member.send('You are not in a MUD related room.');
    } else {
      // Get the NPC id and data
      let npcID = this.determineNPC(args.person, room);
      db.getItem(npcID, 'entities', (data) => this.getProgress(message, args, player, room, data));

    }
  }
  getProgress(message, args, player, room, data) {
    const body = JSON.parse(data.body);
    const person = body.Item;

    if (person === undefined) {
      message.channel.send(`${player.name} is conversing with unseen forces.`);
    }
    else {
      const response = this.determineResponse(person, player);
      this.replyToPlayer(player, message, person, response, room, false);
    }
  }

  cleanArgs(args) {
    // ignore the argument's capitalization
    args.person = args.person.toLowerCase();
    return args;
  }

  // determine what npc the player is looking at
  determineNPC(searchName, room) {
    let npcID;

    if (searchName in room.npcs) {
      npcID = room.npcs[searchName];
    }
    return npcID;
  }

  // creates the npcs response and prompts based on players progress
  determineResponse(npc, player) {
    let response;
        
    if (!(npc === undefined)) {
      // find player's progress with this npc
      if (npc.id in player.progress.npc) { // check if talked to this npc before
        let progress = player.progress.npc[npc.id];
        if (progress in npc.responses) {
          response = npc.responses[progress].reply;
          for (let i = 0; i < npc.responses[progress].prompts.length; i++) {
            response = `${response}\n${npc.responses[progress].prompts[i].prompt}`;
          }
        }
      } else { 
        // haven't talked to this npc before? 
        //NBD create npc progress in the player object and get chattin :)
        player.progress.npc[npc.id] = '0';
        response = npc.responses['0'].reply;
        for (let i = 0; i < npc.responses['0'].prompts.length; i++) {
          response = `${response}\n${npc.responses['0'].prompts[i].prompt}`;
        }
      }
    }
        
    return response;
  }

  // respond to the npc's response
  replyToPlayer(player, message, person, response, room, stop) {
    let responded = false;
    let progress = player.progress.npc[person.id];
    if (!(room === undefined)) {
      if (!(progress === undefined)) {
        if (!(progress === undefined) || !(person.hostile)) {
          message.reply(person.name + ': ' + response);

          if (!stop) {
            // responses change to using length
            const filter = m => ((m.content < person.responses[progress].prompts.length) || (m.content.includes('?talk'))) && m.author.id === message.author.id; //only accepts responses in key and only from the person who started convo
            const collector = message.channel.createMessageCollector(filter, {time: 15000});
    
            collector.on('collect', m => {
              responded = true;
              // stops collector
              collector.stop();
              if (m.content.includes('?talk')) {
                let newResponse = 'Oh ok bye';
                this.replyToPlayer(player, message, person, newResponse, room, true);
              } else {    
                this.makeProgress(player, person, m.content);
                let newResponse = this.determineResponse(person, player);
                this.replyToPlayer(player, message, person, newResponse, room, false);
              }
            });
    
            collector.on('end', () => {
              if (!responded) {
                message.channel.send(`${person.name} walked away from ${player.name}`);
              }
            });
          }
        } else {
          message.channel.send(`${person.name} is quite quiet.`);
        }
      } else {
        message.channel.send(`${player.name} is conversing with unseen forces.`);
      }
    } else {
      message.member.send('You are not in a MUD-related room');
    }
  }

  // Adjusts the players conversational progress with the npc
  makeProgress(player, person, playerResponse) { 
    let currentProgress = player.progress.npc[person.id];
    let progression = currentProgress;

    for (let i = 0; i < person.responses[currentProgress].prompts.length; i++) {			
      if (i.toString() === playerResponse) {
        progression = person.responses[currentProgress].prompts[i].progression;
        break;
      }
    }

    // push the progression to the database
    player.progress.npc[person.id] = progression;
    db.saveItem(player, 'players', () => {});
  }
}

module.exports = TalkCommand;