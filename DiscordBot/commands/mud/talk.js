const { deleteMessage, bigCheck, commandPrefix, inventoryAddItem } = require('../../utilities/globals');
const commando = require('discord.js-commando');
const db = require('../../utilities/dbhandler');
const { COMMAND_CONSTANT } = require('../../Constants/commandConstant');

class TalkCommand extends commando.Command {
  static commandInfo() {
    return(
      `Gab it up with the denizens of the world!
      \`${commandPrefix}talk <npc>\``);
  }
  constructor(client) {
    super(client, COMMAND_CONSTANT('talk', TalkCommand.commandInfo(), true));
    this.assembleMessage = this.assembleMessage.bind(this);
    this.startConvo = this.startConvo.bind(this);
  }

  async run(message, args) {
    bigCheck(message, this.checkNPC.bind(this), args.object);
    deleteMessage(message);
  }

  checkNPC(message, player, room, npc) {
    let npcID;
    if (player.busy === true) {
      message.channel.send(`${player.characterName} is trying to multitask.`);
      return null;
    }
    if (room.npcs[npc]) {
      npcID = room.npcs[npc];
    } else {
      message.channel.send(`${player.characterName} is trying to communicate with unseen forces.`);
      return null;
    }
    this.state = { message, player, room };
    db.getItem(npcID, 'npcs', this.startConvo);
  }

  /*
    evaluate which intro/terminal states are available to player then
    pick the one with the lowest priority setting
  */
  determineStartOrEndState(states, terminal = false) {
    const validStates = [];
    let sendState = { priority: 0 };
    const { player } = this.state;

    Object.keys(states).forEach(state => {
      states[state].reqs ?
        (this.evaluateRequirements(states[state].reqs) ?
          validStates.push(states[state]) : '')
        : validStates.push(states[state]);
    });
    validStates.forEach(state => {
      if (state.priority > sendState.priority) {
        sendState = state;
      }
    });
    if (terminal) {
      db.updateItem(player.id, ['busy'], [false], 'players', () =>{});
    }
    this.assembleMessage(sendState, terminal);
  }

  evaluateRequirements(reqs) {
    return reqs.every((req) => {
      try {
        console.log(req);
        eval(req);
      } catch(error) {
        console.error(error);
        return false;
      }
      return eval(req);
    });
  }

  // go through and set any flags, as well as send the message,
  // and generate prompts for continued convo
  assembleMessage(sendState, terminal = false) {
    const { player, message, npc } = this.state;
    let responded = false;
    const filter = m => m.author.id === message.author.id;
    const collector = message.channel.createMessageCollector(filter, {time: 10000});
    const messageToSend = `:${npc.emoji ? npc.emoji : ''}:**${npc.name} says to <@${player.id}>:**\n*${sendState.reply}*\n`;
    const prompts = sendState.prompts ? 
      this.createPrompt(sendState.prompts) : '';

    sendState.flags ? this.activateFlags(sendState.flags) : '';
    message.channel.send(`${messageToSend}${prompts}`).catch(console.error);
    // if a non-terminal state logic
    if(!terminal){
      collector.on('collect', () => {
        responded = true;
        collector.stop();
      });
      collector.on('end', m => {
        m = m.array()[0];
        if (responded) {
          this.determineNextState(m.content.toLowerCase());
          deleteMessage(m);
        } else {
          db.updateItem(player.id, ['busy'], [false], 'players', () => {});
          message.channel.send(`${npc.name} walked away from ${player.characterName}.`);
          this.determineStartOrEndState(npc.terminals, true);
        }
      });
    }
  }

  createPrompt(prompts) {
    const { player, npc, shopping } = this.state;
    let promptSection = '';
    let x = 0;
    let i = 0;
    this.state.tempPrompts = {};
    if (shopping) {
      promptSection = promptSection.concat(`[––You have ${player.inventory.gold} gold––]\n`);
      npc.goods.forEach((good) => {
        if (good.reqs === undefined || this.evaluateRequirements(good.reqs)) {
          promptSection = promptSection.concat(`[${x}] ${good.item} - ${good.cost} gold\n`);
          this.state.tempPrompts[x] = good;
          x += 1;
        }
      });
    } else {
      for (i = 0; i < prompts.length; i++) {
        if(prompts[i].reqs === undefined || (prompts[i].reqs && this.evaluateRequirements(prompts[i].reqs))) {
          promptSection = promptSection.concat(`[${x}] ${prompts[i].prompt}\n`);
          this.state.tempPrompts[x] = prompts[i];
          x += 1;
        }
      }
    }
    return promptSection;
  }

  //activate the flags from npc dialog if any
  //be very careful with this
  activateFlags(flags) {
    const { player } = this.state;
    flags.forEach( flag=> {
      try {
        eval(flag.property);
      }
      catch(error) {
        console.error(error);
        db.updateItem(player.id, ['busy'], [false], 'players', () => {});
        return null;
      }
      db.updateItem(player.id, ['inventory'], [player.inventory], 'players', () => {});
    });
  }

  startConvo({body}) {
    const npc = JSON.parse(body).Item;
    const { player, message } = this.state;
    db.updateItem(player.id, ['busy'], [true], 'players', () =>{});
    message.channel.send(`${player.characterName} is talking to ${npc.name}.`);
    this.state.npc = npc;
    this.determineStartOrEndState(npc.intros);
  }

  tryBuy(item) {
    const { player, npc } = this.state;
    if (item) {
      if (player.inventory.gold >= item.cost) {
        player.inventory.gold -= item.cost;
        db.getItem(item.id, 'items', data => 
          inventoryAddItem(data, player, () => this.assembleMessage(npc.shopping.success))
        );
      }
    } else {
      this.assembleMessage(npc.shopping.failure);
    }
  }

  determineNextState(selection) {
    const { player, npc, message, tempPrompts, shopping } = this.state;
    let type;
    if (shopping && !selection.includes('leave')) {
      this.tryBuy(tempPrompts[selection]);
      return null;
    } else {
      type = tempPrompts[selection] ? 
        Object.keys(tempPrompts[selection]['progression'])[0] : '';
    }
    if (selection.includes('leave') || type === 'terminals') {
      message.channel.send(`${player.characterName} walked away from ${npc.name}.`);
      this.determineStartOrEndState(npc.terminals, true);
    } else if (type === 'shopping') {
      this.state.shopping = true;
      this.assembleMessage(npc[type][tempPrompts[selection]['progression'][type]]);
    } else if (tempPrompts[selection] !== undefined && type !== undefined) {
      // this is black magic fuckery, don't worry about it too much
      this.assembleMessage(npc[type][tempPrompts[selection]['progression'][type]]);
    } else {
      this.determineStartOrEndState(npc.terminals, true);
    }
  }
}

module.exports = TalkCommand;