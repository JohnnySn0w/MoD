const {
  bigCheck,
  checkItems,
  checkKeys,
  commandPrefix,
  generateRoomDescription,
  sendMessageRoom,
  sendMessagePrivate, 
} = require('../../utilities/globals');
const commando = require('discord.js-commando');
const { getItem } = require('../../utilities/dbhandler');
const inventory = require('./inventory');
const { COMMAND_CONSTANT } = require('../../Constants/commandConstant');

class LookCommand extends commando.Command {
  static commandInfo() {
    return(
      `Gives a description of an entity, place, or thing
      \`${commandPrefix}look <something>\`
      example somethings: \`here\`, \`around\`, \`room\`, \`old man\`
      If more than one thing has the same name, they will 
      be listed with their type, and a selection may be made.`);
  }
  static aliases() { return ['view', 'observe', 'l']; }
  constructor(client) {
    super(client, COMMAND_CONSTANT(
      'look',
      LookCommand.commandInfo(),
      true,
      LookCommand.aliases(),
    ));
    this.message;
    this.player;
    this.room;
    this.searchName;
  }

  //generates list of arrays of  [ table/type, id, special?, ?specialtype ]
  async run(message, args) {
    this.searchName = args.object;
    bigCheck(message, this.generateLookList.bind(this));
  }

  /*
    get the player name list first. Then add in everything else.
    Since player names are effectively the only things that 
    might cause a collision (unless you decide to be silly 
    about your npc/item/enemy namings)
  */
  generateLookList(message, player, room) {
    let lookList = [];
    this.message = message;
    this.player = player;
    this.room = room;
    let playerDifferentiator = 0;
    this.room.players.forEach((playerObj) => {
      // the only key will be player id, so use that to get the name
      const playerId = Object.keys(playerObj)[0];
      if(playerObj[playerId] === this.searchName) {
        playerObj = [ 'players', playerId, false ];
        if(lookList.length > 1) {
          playerObj[playerId] = this.searchName + playerDifferentiator;
          playerDifferentiator++;
        }
        lookList.push(playerObj);
      }
    });
    const npc = this.determineNPCEnemy('npcs');
    const enemy = this.determineNPCEnemy('enemies');
    const item = this.determineItem();
    const extra = this.checkExtras();

    npc ? lookList.push(npc) : null ;
    enemy ? lookList.push(enemy) : null;
    item ? lookList.push(...item) : null;
    extra ? lookList.push(...extra) : null;
    this.evaluateLookList(lookList);
  }

  checkExtras() {
    let extrasList = [];
    switch (this.searchName) {
    case '':
    case 'room':
    case 'here':
    case 'around':
    case 'area':
      extrasList.push([ 'rooms', this.room.id, true, 'room' ]);
      break;
    case 'inventory':
    case 'items':
    case 'equipped':
    case 'equipment':
    case 'bag':
      extrasList.push([ 'commands', inventory, true, 'command' ]);
      break;
    case 'me':
    case 'self':
    case 'myself':
      extrasList.push([ 'players', this.player.id, false ]);
      break;
    case 'gold':
      extrasList.push([ 'gold', 'gold', true, 'currency']);
      break;
    default:
      return undefined;
    }
    return extrasList;
  }

  // determine what item the player is looking at in the given room
  determineItem() {
    let itemList = [];
    const key = checkKeys(this.player, this.searchName);
    const reg = checkItems(this.player, this.searchName);
    const roomItem = this.room.items[this.searchName];

    if (roomItem) {
      itemList.push([ 'items', roomItem, false, 'room item' ]);
    }
    if (key) {
      itemList.push([ 'items', key, false, 'key item' ]);
    }
    if (reg) {
      itemList.push([ 'items', reg, false, 'regular item' ]);
    }

    return itemList;
  }
    
  // determine what NPC/enemy the player is looking at in the given room
  determineNPCEnemy(type) {
    let typeId = '';
    typeId = this.room[type][this.searchName];
    if (typeId) {
      return [ type, typeId, false ];
    } else {
      return undefined;
    }
  }

  replyToPlayer({ body }) {
    const thing = JSON.parse(body).Item;
    sendMessagePrivate(this.message, thing.description);
  }


  /*
    the list should be array of arrays of [ table/type, id, special?, ?specialtype ]
  */
  evaluateLookList(lookList) {
    // they are truly looking at nothing, or misspelling
    if (lookList.length === 0) {
      sendMessageRoom(this.client, `${this.player.characterName} stares into space.`, this.room);
      return null;
    } else if (lookList.length === 1) {
    // there's one thing on the list, so use it
      this.evaluateItem(lookList[0]);
    } else {
      // list the list to them and give options
      this.genSelectionList(lookList);
    }
  }

  // [ table/type, id, special?, ?specialtype ]
  evaluateItem(item) {
    //is it special?
    let description = '';
    if (item[2]) {
      switch (item[3]) {
      case 'currency':
        description = 'worth something to someone, probably?';
        break;
      case 'room':
        description = generateRoomDescription(this.room);
        break;
      case 'command':
        new inventory(this.client).run(this.message);
        break;
      default:
        //zero reason for this to ever show, unless someone fucks the code
        description = 'tell the admins that this description is horribly broken.\
        this isn’t an error message, its FUBAR';
      }
      sendMessagePrivate(this.message, description);
    } else {
      getItem(item[1], item[0], this.replyToPlayer.bind(this));
    }
    
  }

  // use a timer, and then send a 1 item (selected by user) looklist to evaluateLookList()
  genSelectionList(lookList) {
    let responded = false;
    let x = 1;
    let selection = 'There are a few things with that name, which one didja mean?(use number to select)';
    for (x; x <= lookList.length; x++) {
      selection = selection + `\n${x}. ${lookList[x-1][0]}`;
    }
    const filter = m => m.author.id === this.message.author.id;
    sendMessagePrivate(this.message, selection);
    const collector = this.message.channel.createMessageCollector(filter, {time: 10000});
    collector.on('collect', () => {
      responded = true;
      collector.stop();
    });
    collector.on('end', m => {
      if (responded) {
        m = Number.parseInt(m.array()[0].content);
        Number.isInteger(m) ?
          this.evaluateItem(lookList[m-1]) : sendMessagePrivate(this.message, 'bad input, try again');
      } else {
        sendMessagePrivate(this.message, 'o ok, nvm then');
      }
    });
  }

}

module.exports = LookCommand;
