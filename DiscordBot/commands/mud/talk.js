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
          key: 'npc',
          prompt: 'Who are you talking to?',
          type: 'string'
        }
      ]
    });
  }

  async run(message, {npc}) {
    // get the player object so that we know the player's progress with this NPC
    db.getItem(message.member.id, 'players', (data) => this.getPlayer(message, npc, data));
    // delete the user's command if not debugging
    if (!DEBUG){
      message.delete();
    }
  }

  getPlayer(message, npc, data) {
    // grab the actual player object
    let player = JSON.parse(data.body).Item;

    if (player === undefined) {
      // if we couldn't find the player, they haven't started yet
      message.member.send('It seems that you\'re not a part of the MUD yet! \nUse `?start` in test-zone to get started!');
    }
    else {
      // otherwise, get the room object that the player is in
      db.getItem(message.channel.id, 'rooms', (data) => this.getRoom(message, npc, player, data));
    }
  }

  getRoom(message, entity, player, data) {
    // grab the actual player object
    const room = JSON.parse(data.body).Item;
    entity = this.cleanArgs(entity);

    if (room === undefined) {
      message.member.send('You are not in a MUD related room.');
    } else {
      // determine if the player is talking to an NPC
      if (room.npcs[entity]) {
        db.getItem(room.npcs[entity], 'npcs', (data) => this.getProgress(message, player, room, data));
      } else {
        // if not an npc, determine if the player is talking to an enemy
        if (room.enemies[entity]) {
          // if an enemy, then mention that the player can't talk to the enemy
          message.channel.send(`The ${entity} would rather a fight than a chat.`);
        } else {
          // if not an enemy either, they're talking to no one
          message.channel.send(`${player.name} is conversing with no one.`);
        }
      }
    }
  }

  cleanArgs(npc) {
    // ignore the argument's capitalization
    npc = npc.toLowerCase();
    return npc;
  }

  getProgress(message, player, room, data) {
    const npc = JSON.parse(data.body).Item;

    if (npc === undefined) {
      message.channel.send(`${player.name} is conversing with unseen forces.`);
    } else {
      const [response, responseNum] = this.determineResponse(npc, player);
      this.replyToPlayer(player, message, npc, response, responseNum, room, false);
    }
  }

  // creates the npcs response and prompts based on players progress
  determineResponse(npc, player) {
    let response;
    let responseNum = 0;

    // find player's progress with this npc
    let playerProgress = player.progress.npc[npc.id];
    if (playerProgress) {
      // ensure that the npc has an actual response for that progress
      if (npc.responses[playerProgress]) {
        response = npc.responses[playerProgress].reply;
        // determine if the player is in a shopkeep menu
        if (playerProgress !== "list" & playerProgress !== "success" & playerProgress !== "failure" & playerProgress !== "soldout") {
          // create the dialogue tree for the player
          for (var i = 0; i < npc.responses[playerProgress].prompts.length; i++) {
            response = response + '\n' + npc.responses[playerProgress].prompts[i].prompt;
            responseNum = responseNum + 1;
          }
        } else {
          // if the player is in a shopkeep menu, list the goods and the player's gold
          response = response + `\n[--You have ${player.inventory.gold} gold--] `;
          for (var i = 0; i < npc.goods.length; i++) {
            // if the player already has the item, then don't offer it to them
            if (!player.inventory.keys[npc.goods[i].id]) {
              response = response + '\n [' + i + '] ' + npc.goods[i].item + ' - ' + npc.goods[i].cost + ' gold';
            }
            else {
              response = response + '\n [' + i + '] ' + npc.goods[i].item + ' - SOLD OUT';
            }
            responseNum = responseNum + 1;
          }
        }
      } else {
        message.channel.send(`${player.name} replied to ${npc.name} in a strange way.`);
      }
    } else {
      // if the player hasn't talked to this NPC before, create the player's progress in their object
      player.progress.npc[npc.id] = '0';
      response = npc.responses['0'].reply;

      // create the dialoge tree for the player
      for (let i = 0; i < npc.responses['0'].prompts.length; i++) {
        response = `${response}\n${npc.responses['0'].prompts[i].prompt}`;
        responseNum = responseNum + 1;
      }
    }
    
    // return the npc's response and the number of replies the player can give to the npc
    return [response, responseNum];
  }

  // respond to the npc's response
  replyToPlayer(player, message, npc, response, responseNum, room, stop) {
    let responded = false;
    let progress = player.progress.npc[npc.id];

    if (npc.responses !== undefined) {
      message.reply(`${npc.name} says: ${response}`);

      if (!stop) {
        // responses change to using length
        const filter = m => (((m.content < responseNum) && (Number.isInteger(Number(m.content)))) || (m.content.includes('?talk'))) && m.author.id === message.author.id; //only accepts responses in key and only from the person who started convo
        const collector = message.channel.createMessageCollector(filter, {time: 20000});

        collector.on('collect', m => {
          responded = true;
          collector.stop();
          
          if (m.content.includes('?talk')) {
            let newResponse = 'Oh ok bye';
            this.replyToPlayer(player, message, npc, newResponse, 1, room, true);
          } else {
            this.makeProgress(player, npc, m.content, message);
            let [newResponse, newResponseNum] = this.determineResponse(npc, player);
            this.replyToPlayer(player, message, npc, newResponse, newResponseNum, room, false);
          }
        });

        collector.on('end', () => {
          if (!responded) {
            message.channel.send(`${npc.name} walked away from ${player.name}`);
            if (npc.goods.length > 0){ // let shopkeeps reset back to their first state everytime...
              player.progress.npc[npc.id] = '0';
              db.updateItem(player.id, ['progress'], [player.progress], 'players', () => {});
            }
          }
        });
      }
    } else {
      message.channel.send(`${npc.name} has nothing to say.`);
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
        if (person.goods[playerResponse].soldOut) {
          progression = 'soldout';
        }
        else {
          //TODO THIS IS BREAKING WHYYYYYY
          console.log(JSON.stringify(person.goods[playerResponse].id));
          console.log(playerResponse);
          db.getItem(person.goods[playerResponse].id, 'items', (data) => this.buyItem(player, person, data));
          //this.buyItem(player, person, person.goods[playerResponse]);
        }
      } else {
        progression = 'failure';
      }
    }

    // push the progression to the database
    player.progress.npc[person.id] = progression;
    db.updateItem(player.id, ['progress'], [player.progress], 'players', () => {});
  }

  checkGold(player, person, choice) { // checks price and returns if player can afford it
    let itemCost = person.goods[choice].cost;
    if (player.inventory.gold < itemCost) { return false;} 
    else { return true; }
  }

  buyItem(player, person, data) {
    //player.inventory[player.inventory.length]= item.id; // Idk how we're doing inventory but rn, im just pushing the item's id
    // add to player inventory
    //db.updateItem(player.id, ['inventory'], [item.id], 'players', () => {});
    let item = JSON.parse(data.body).Item;
    
    // update player inventory depending on the item they bought
    if (item.type === "key")
      player.inventory.keys.push(item.id);
    else if (item.type === "weapon")
      player.inventory.weapon = item.id;
    else if (item.type === "armor")
      player.inventory.armor = item.id;
    else {
      console.log("Item is not a grabbable.");
      return;
    }

    // take gold from player inventory
    player.inventory.gold = player.inventory.gold - item.cost;
    db.updateItem(player.id, ['inventory'], [player.inventory], 'players', () => {});
  }
}

module.exports = TalkCommand;