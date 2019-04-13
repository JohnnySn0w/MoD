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
      message.member.send('It seems that you\'re not a part of the MUD yet! \nUse `?start` in test-zone to get started!');
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
      db.getItem(npcID, 'entities', (data) => this.getProgress(message, player, room, data));

    }
  }
  getProgress(message, player, room, data) {
    const body = JSON.parse(data.body);
    const person = body.Item;

    if (person === undefined) {
      message.channel.send(`${player.name} is conversing with unseen forces.`);
    }
    else {
      const [response, responseNum] = this.determineResponse(person, player);
      this.replyToPlayer(player, message, person, response, responseNum, room, false);
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
	  let responseNum = 0;
    let offset = 0;
    if(npc.hostile){
      response = `${npc.name} would rather a fight than a chat.`;
    } else if (!(npc === undefined)) {
      // find player's progress with this npc
      if (player.progress.npc[npc.id]) { // check if talked to this npc before
        let progress = player.progress.npc[npc.id];
        if (npc.responses[progress]) {
          response = npc.responses[progress].reply;
		      if (progress == "0" || !(npc.goods.length > 0)) {
			      for (var i = 0; i < npc.responses[progress].prompts.length; i++) {
			        response = response + '\n' + npc.responses[progress].prompts[i].prompt;
			        responseNum = responseNum + 1;
			      }
		      } else {
			      response = response + `\n[[You have ${player.gold} gold.]]`;
			      for (var i = 0; i < npc.goods.length; i++) {
              if(!npc.goods[i].soldOut) { //if its not sold out, list it! :^)
			          response = response + '\n [' + i + '] ' +  npc.goods[i].item + ' - ' + npc.goods[i].cost + ' gold';
              }
			        responseNum = responseNum + 1;
			      }
		      }
        }
      } else { 
        // haven't talked to this npc before? 
        //NBD create npc progress in the player object and get chattin :)
        player.progress.npc[npc.id] = '0';
        response = npc.responses['0'].reply;
        for (let i = 0; i < npc.responses['0'].prompts.length; i++) {
          response = `${response}\n${npc.responses['0'].prompts[i].prompt}`;
			    responseNum = responseNum + 1;
        }
      }
    }        
    return [response, responseNum];
  }

  // respond to the npc's response
  replyToPlayer(player, message, person, response, responseNum, room, stop) {
    //console.log(responseNum);
    let responded = false;
    let progress = player.progress.npc[person.id];
    if (!(person.responses === undefined)) {
      if (!(person.hostile)) {
        message.reply(`${person.name} says: ${response}`);

        if (!stop) {
          // responses change to using length
          const filter = m => (((m.content < responseNum) && (Number.isInteger(Number(m.content)))) || (m.content.includes('?talk'))) && m.author.id === message.author.id; //only accepts responses in key and only from the person who started convo
          const collector = message.channel.createMessageCollector(filter, {time: 20000});
  
          collector.on('collect', m => {
            responded = true;
            // stops collector
            if ((person.goods.length > 0) && progress != '0')
            {
              if (person.goods[m.content].soldOut) {
                return;
              } else {
                collector.stop();
              }
            } else { collector.stop(); }            
            if (m.content.includes('?talk')) {
              let newResponse = 'Oh ok bye';
              this.replyToPlayer(player, message, person, newResponse, 1, room, true);
            } else {    
              this.makeProgress(player, person, m.content, message);
              let [newResponse, newResponseNum] = this.determineResponse(person, player);
              this.replyToPlayer(player, message, person, newResponse, newResponseNum, room, false);
            }
            
          });
  
          collector.on('end', () => {
            if (!responded) {
              message.channel.send(`${person.name} walked away from ${player.name}`);
              if (person.goods.length > 0){ // let shopkeeps reset back to their first state everytime...
                player.progress.npc[person.id] = '0';
                db.updateItem(player.id, ['progress'], [player.progress], 'players', () => {});
              }
            }
          });
        }
      } else {
        message.channel.send(`${person.name} would rather a fight than a chat.`);
      }
    } else {
      message.channel.send(`${person.name} is quite quiet.`);
    }
  }

  // Adjusts the players conversational progress with the npc
  makeProgress(player, person, playerResponse, message) { 
    let currentProgress = player.progress.npc[person.id];
    let progression = currentProgress;

	  if (!(person.goods.length > 0) || progression == '0') {
	    for (let i = 0; i < person.responses[currentProgress].prompts.length; i++) {			
		    if (i.toString() === playerResponse) {
		      progression = person.responses[currentProgress].prompts[i].progression;
		      break;
		    }
	    }
	  }
    else {
      //let itemID = person.goods[Object.keys(person.goods)[playerResponse]];
      if (this.checkGold(player, person, playerResponse)) {
        progression = 'success';
        this.buyItem(player, person, person.goods[playerResponse]);
      } else {
        progression = 'failure';
      }
    }

    // push the progression to the database
    player.progress.npc[person.id] = progression;
    db.updateItem(player.id, ['progress'], [player.progress], 'players', () => {});
  }

  checkGold(player, person, choice)
  { // checks price and returns if player can afford it
    let itemCost = person.goods[choice].cost;
    if (player.gold < itemCost) { return false;} 
    else { return true; }
  }

  buyItem(player, person, item)
  {
    if (!item.soldOut)
    {
      player.inventory[player.inventory.length]= item.id; // Idk how we're doing inventory but rn, im just pushing the item's id
      // add to player inventory
      db.updateItem(player.id, ['inventory'], [item.id], 'players', () => {});
      // take gold from player inventory
      player.gold = player.gold - item.cost;
      db.updateItem(player.id, ['gold'], [player.gold], 'players', () => {});
      // set item to sold out in npc goods section
      // TODO: repopulate after a period of time?
      item.soldOut = true;
      db.updateItem(person.id, ['goods'], [person.goods], 'entities', () => {});
    }
  }
}

module.exports = TalkCommand;