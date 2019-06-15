const {deleteMessage, bigCheck} = require('../../globals.js');
const commando = require('discord.js-commando');
const db = require('../../../dbhandler');

class TalkCommand extends commando.Command {
  static commandInfo() {
    return('Gab it up with NPCs!\n`?talk <npc>`');
  }
  constructor(client) {
    super(client, {
      name: 'talk',
      group: 'mud',
      memberName: 'talk',
      description: TalkCommand.commandInfo(),
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
    bigCheck(message, this.checkNPC.bind(this), npc);
    deleteMessage(message);
  }

  checkNPC(message, player, room, npc) {
    let npcID;
    if (room.npcs[npc]) {
        npcID = room.npcs[npc];
    } else {
        message.channel.send(`${player.characterName} is trying to communicate with unseen forces.`);
        return null;
    }
    this.state = { message, player, room };
    db.getItem(npcID, 'npcs', this.startConvo.bind(this));
  }

  /*
    evaluate which intro/terminal states are available to player then
    pick the one with the lowest priority setting
  */
  determineStartOrEndState(states, terminal=false) {
    const validStates = [];
    let sendState = { priority: 0 };
    Object.keys(states).forEach(state => {
      states[state].reqs ?
      (this.evaluateRequirements(states[state].reqs) ?
      validStates.push(states[state])
      : '')
      : validStates.push(states[state]);
    });
    validStates.forEach(state => {
      if (state.priority > sendState.priority) {
        sendState = state;
      }
    });
    this.assembleMessage(sendState, terminal);
  }

  evaluateRequirements(reqs) {
    return reqs.every((req) => {
      return eval(req);
    });
  }

  // go through and set any flags, as well as send the message,
  // and generate prompts for continued convo
  assembleMessage(sendState, terminal) {
    let responded = false;
    const { player, message, npc} = this.state;
    const filter = m => m.author.id === message.author.id;
    const collector = message.channel.createMessageCollector(filter, {time: 10000});
    const messageToSend = `:${npc.emoji}:**${npc.name} says to <@${player.id}>:**\n*${sendState.reply}*\n`;
    const prompts = sendState.prompts ? this.createPrompt(sendState.prompts) : '';

    sendState.flags ? this.activateFlags(sendState.flags) : '';
    message.channel.send(`${messageToSend}${prompts}`).catch(console.error);
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
          message.channel.send(`${npc.name} walked away from ${player.characterName}.`);
          this.determineStartOrEndState(npc.terminals, true);
        }
      });
    }
  }

  createPrompt(prompts) {
    let promptSection = '';
    let x = 0;
    let i = 0;
    this.state.tempPrompts = {};
    for (i = 0; i < prompts.length; i++) {
      if(prompts[i].reqs && this.evaluateRequirements(prompts[i].reqs)) {
        promptSection = promptSection.concat(`[${x}] ${prompts[i].prompt}\n`);
        this.state.tempPrompts[x] = prompts[i];
        x++;
      } else if (prompts[i].reqs === undefined) {
        promptSection = promptSection.concat(`[${x}] ${prompts[i].prompt}\n`);
        this.state.tempPrompts[x] = prompts[i];
        x++;
      }
    }
    return promptSection;
  }

  //activate the flags from npc dialog if any
  //be very careful with this
  activateFlags(flags) {
    const { player } = this.state;
    flags.forEach( flag=> {
      eval(flag.property);
      db.updateItem(player.id, ['inventory'], [player.inventory], 'players', () => {});
    });
  }

  startConvo({body}) {
    const npc = JSON.parse(body).Item;
    const { player } = this.state;
    db.updateItem(player.id, ['busy'], [true], 'players', () =>{});
    this.state.npc = npc;
    this.determineStartOrEndState(npc.intros);
  }

  determineNextState(selection) {
    const { player, npc, message, tempPrompts } = this.state;
    const type = Object.keys(tempPrompts[selection]['progression'])[0];

    if (selection.includes('leave') || type === 'terminals') {
      db.updateItem(player.id, ['busy'], [false], 'players', () =>{});
      message.channel.send(`${player.characterName} walked away from ${npc.name}.`);
      this.determineStartOrEndState(npc.terminals, true);
      return null;
    } else if (tempPrompts[selection] !== undefined && type !== undefined) {
      this.assembleMessage(npc[type][tempPrompts[selection]['progression'][type]]);
    } else {
      this.determineStartOrEndState(npc.terminals, true);
    }
  }
}

module.exports = TalkCommand;