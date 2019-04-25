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
      db.getItem(message.channel.name, 'rooms', (data) => this.getRoom(message, npc, player, data));
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

    // if the npc doesn't exist, print it
    if (npc === undefined) {
      message.channel.send(`${player.name} is conversing with unseen forces.`);
    } else {
      // otherwise, grab the npc's response and number of dialogue options
      const [npcResponse, playerResponseCount] = this.determineResponse(npc, player);
      this.replyToPlayer(player, message, npc, npcResponse, playerResponseCount, room, false);
    }
  }

  // creates the npcs response and prompts based on players progress
  determineResponse(npc, player) {
    let npcResponse;
    let playerResponseCount = 0;

    // find player's progress with this npc
    let playerProgress = player.progress.npc[npc.id];

    if (playerProgress) {

      // ensure that the npc has an actual response for that progress
      if (npc.responses[playerProgress]) {
        npcResponse = npc.responses[playerProgress].reply;
        
        // determine if the player is in a shopkeep menu
        if (playerProgress !== "list" & playerProgress !== "success" & playerProgress !== "failure" & playerProgress !== "soldout") {

          // create the dialogue tree for the player
          for (var i = 0; i < npc.responses[playerProgress].prompts.length; i++) {
            npcResponse = npcResponse + '\n' + npc.responses[playerProgress].prompts[i].prompt;
            // numOfResponses = numOfResponses + 1;
          }

          playerResponseCount = npc.responses[playerProgress].prompts.length;
          
        } else {

          // if the player is in a shopkeep menu, list the goods and the player's gold
          npcResponse = npcResponse + `\n[--You have ${player.inventory.gold} gold--] `;
          for (var i = 0; i < npc.goods.length; i++) {
            npcResponse = npcResponse + '\n [' + i + '] ' + npc.goods[i].item + ' - '

            // if the player already has the item and it's a key item, then don't offer it to them
            if (player.inventory.keys[npc.goods[i].id]) {
              npcResponse = npcResponse + 'SOLD OUT';
            } else {
              npcResponse = npcResponse + npc.goods[i].cost + ' gold';
            }
            // numOfResponses = numOfResponses + 1;
          }

          playerResponseCount = npc.goods.length;
        }

      } else {
        // if there's no npc response that matches the player's progress...
        message.channel.send(`${player.name} talks to ${npc.name} in a strange way.`);
      }

    } else {
      // if the player hasn't talked to this NPC before, create the player's progress in their object
      player.progress.npc[npc.id] = '0';
      npcResponse = npc.responses['0'].reply;

      // create the dialoge tree for the player
      for (let i = 0; i < npc.responses['0'].prompts.length; i++) {
        npcResponse = `${npcResponse}\n${npc.responses['0'].prompts[i].prompt}`;
      }

      playerResponseCount = npc.responses['0'].prompts.length;
    }
    
    // return the npc's response and the number of replies the player can give to the npc
    return [npcResponse, playerResponseCount];
  }

  // have the npc reply to the player
  replyToPlayer(player, message, npc, npcResponse, playerResponseCount, room, stop) {
    let responded = false;

    // ensure that the npc has a dialogue tree
    if (npc.responses !== undefined) {
      message.reply(`${npc.name} says: ${npcResponse}`);

      if (!stop) {
        // if the player is still talking to the npc, create a collector for the player's responses
        const filter = m => (((m.content < playerResponseCount) && (Number.isInteger(Number(m.content)))) || (m.content.includes('?talk'))) && m.author.id === message.author.id; //only accepts responses in key and only from the person who started convo
        const collector = message.channel.createMessageCollector(filter, {time: 20000});

        // if the player responses...
        collector.on('collect', m => {
          responded = true;
          // stop the collector or else we'll have infinite collectors!!!
          collector.stop();
          
          // kill the conversation if the player is trying to talk to another NPC
          if (m.content.includes('?talk')) {
            let newNpcResponse = 'Oh ok bye';
            this.replyToPlayer(player, message, npc, newNpcResponse, 1, room, true);
          } else {
            // depending on the player's response, edit the player's progress with this NPC
            this.makeProgress(player, npc, m.content);
            // recursively call this function every time the player interacts with the npc for this one dialogue instance
            let [newNpcResponse, newPlayerResponseCount] = this.determineResponse(npc, player);
            this.replyToPlayer(player, message, npc, newNpcResponse, newPlayerResponseCount, room, false);
          }
        });

        // if the collector times out
        collector.on('end', () => {
          // if the player never responded then alert the player that the NPC is no longer listening
          if (!responded) {
            message.channel.send(`${npc.name} walked away from ${player.name}`);
            
            // reset the shopkeeper NPC back to its default state
            if (npc.goods.length > 0){
              player.progress.npc[npc.id] = '0';
              db.updateItem(player.id, ['progress'], [player.progress], 'players', () => {});
            }
          }
        });
      }

    } else {
      // if the npc has no responses...
      message.channel.send(`${npc.name} has nothing to say.`);
    }
  }
  
  makeProgress(player, npc, playerResponse) {
    // adjusts the players conversational progress with the npc
    let currentProgress = player.progress.npc[npc.id];
    let progression = currentProgress;

    // if the npc isn't a shopkeeper or the player's progression with the shopkeeper is zero...
	  if (!(npc.goods.length > 0) || progression == '0') {
      // iterate through the npc's list of responses for the one that the player submitted
	    for (let i = 0; i < npc.responses[currentProgress].prompts.length; i++) {			
		    if (i.toString() === playerResponse) {
		      progression = npc.responses[currentProgress].prompts[i].progression;
		      break;
		    }
	    }
	  } else {
      // if the player is buying an item, check to make sure they have enough gold
      if (this.checkGold(player, npc, playerResponse)) {
        // check to make sure the item isn't "sold out"
        if (player.inventory.keys[npc.goods[playerResponse].id]) {
          progression = 'soldout';
        } else {
          db.getItem(npc.goods[playerResponse].id, 'items', (data) => this.buyItem(player, npc.goods[playerResponse].cost, data));
          progression = 'success';
        }
      } else {
        progression = 'failure';
      }
    }

    // push the progression to the database
    player.progress.npc[npc.id] = progression;
    db.updateItem(player.id, ['progress'], [player.progress], 'players', () => {});
  }

  checkGold(player, npc, choice) {
    // checks the price of the item and returns if player can afford it
    if (player.inventory.gold < npc.goods[choice].cost)
      return false;
    else
      return true;
  }

  buyItem(player, cost, data) {
    let item = JSON.parse(data.body).Item;
    
    // if the item is a key item, add it to the player's list of keys
    if (item.type === "key") {
      player.inventory.keys[item.id] = {
        'name': item.name,
        'used': false
      }
    // if the item is a weapon or armor...
    } else if (item.type === "weapon" || item.type === "armor") {
      // check to see if the player already has that item
      if (player.inventory.items[item.id]) {
        // if so, bump the item's amount
        player.inventory.items[item.id].amount = player.inventory.items[item.id].amount + 1;
      } else {
        // if not, add the item to the player's inventory
        player.inventory.items[item.id] = {
          'name': item.name,
          'type': item.type,
          'equipped': false,
          'amount': 1
        }
      }
    } else {
      console.log("Item is not a grabbable.");
      return;
    }

    console.log(JSON.stringify(player.inventory));

    // take gold from player inventory
    player.inventory.gold = player.inventory.gold - cost;
    // update the player's inventory
    db.updateItem(player.id, ['inventory'], [player.inventory], 'players', () => {});
  }
}

module.exports = TalkCommand;