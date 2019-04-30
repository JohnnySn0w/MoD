const globals = require('../../globals.js');
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
    //db.getItem(message.member.id, 'players', (data) => this.getPlayer(message, npc, data));
    globals.bigCheck(message, npc, this.getNPC.bind(this));
    // delete the user's command if not debugging
    if (!globals.DEBUG){
      message.delete();
    }
  }

  getNPC(message, npc, player, room) {
    if (!player.busy) {
      if (room.npcs[npc]) {
        db.getItem(room.npcs[npc], 'npcs', (data) => this.getProgress(message, player, room, data));
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
    else {
      message.channel.send(`${player.name} is too busy for chit chat`);
    }
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
            if (!player.inventory.keys.includes(npc.goods[i].id)) {
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
        db.updateItem(player.id, ['busy'], [true], 'players', ()=>{ console.log("yes busy!"); });
        // responses change to using length
        const filter = m => (((m.content < responseNum) && (Number.isInteger(Number(m.content)))) || (m.content.includes('?talk'))) && m.author.id === message.author.id; //only accepts responses in key and only from the person who started convo
        const collector = message.channel.createMessageCollector(filter, {time: 20000});

        collector.on('collect', m => {
          responded = true;
          collector.stop();
          
          if (m.content.includes('?talk')) {
            db.updateItem(player.id, ['busy'], [false], 'players', ()=>{ console.log("not busy!"); });
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
            db.updateItem(player.id, ['busy'], [false], 'players', ()=>{ console.log("not busy!"); });
          }
        });
      }
    } else {
      message.channel.send(`${npc.name} has nothing to say.`);
    }
  }

  // Adjusts the players conversational progress with the npc
  makeProgress(player, npc, playerResponse, message) { 
    let currentProgress = player.progress.npc[npc.id];
    let progression = currentProgress;

	  if (!(npc.goods.length > 0) || progression == '0') {
	    for (let i = 0; i < npc.responses[currentProgress].prompts.length; i++) {			
		    if (i.toString() === playerResponse) {
		      progression = npc.responses[currentProgress].prompts[i].progression;
		      break;
		    }
	    }
	  }
    else {
      //let itemID = npc.goods[Object.keys(npc.goods)[playerResponse]];
      if (this.checkGold(player, npc, playerResponse)) {
        if (player.inventory.keys.includes(npc.goods[playerResponse].id)) {
          progression = 'soldout';
        }
        else {
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

  checkGold(player, npc, choice) { // checks price and returns if player can afford it
    let itemCost = npc.goods[choice].cost;
    if (player.inventory.gold < itemCost) { return false;} 
    else { return true; }
  }

  buyItem(player, cost, data) {
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

    console.log(JSON.stringify(player.inventory));

    // take gold from player inventory
    player.inventory.gold = player.inventory.gold - cost;
    db.updateItem(player.id, ['inventory'], [player.inventory], 'players', () => {});
  }
}

module.exports = TalkCommand;