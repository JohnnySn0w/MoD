const { emojiCheck, commandPrefix, sendMessagePrivate, updateRoomPopulace } = require('../../utilities/globals');
const commando = require('discord.js-commando');
const { updateItem, getItem } = require('../../utilities/dbhandler');
const { COMMAND_CONSTANT } = require('../../Constants/commandConstant');

class Describe extends commando.Command {
  static commandInfo() {
    return(
      `Set your description or name.
      Usage: \`${commandPrefix}describe <"self" or "name" or "emoji"> <what you are setting it to>\`.
      A valid example would be \`${commandPrefix}describe name Atreyu\` to set your player name to Atreyu`);
  }

  static aliases() { return ['set']; }

  constructor(client) {
    super(client, COMMAND_CONSTANT(
      'describe',
      Describe.commandInfo(),
      true,
      Describe.aliases(),
    ));
    this.updateNameInRoom = this.updateNameInRoom.bind(this);
    this.player;
    this.description;
    this.type;
  }
  
  async run(message, args) {
    const arguements = /\w+\s/g.exec(args.object);
    if (arguements === undefined) {
      sendMessagePrivate(message, 'That\'s not how describe works, check `help`');
      return null;
    }
    this.type = arguements[0].replace(/\s/, '');
    this.description = arguements.input.replace(arguements[0],'');
    this.determineDescribeType(message);
  }

  determineDescribeType(message) {
    switch (this.type) {
    case 'emoji':
      emojiCheck(this.description, this.client.emojis);
      updateItem(message.author.id, ['emoji'], [this.description], 'players');
      sendMessagePrivate(message, `Your character icon is now ${this.description}`);
      break;
    case 'self':
      updateItem(message.author.id, ['description'], [this.description], 'players');
      sendMessagePrivate(message, 'Your description is updated');
      break;
    case 'name':
      updateItem(message.author.id, ['characterName'], [this.description], 'players');
      sendMessagePrivate(message, `Your name is now ${this.description}`);
      getItem(message.author.id, 'players', (data) => {
        this.player = JSON.parse(data.body).Item;
        getItem(this.player.currentRoomId, 'rooms', this.updateNameInRoom);
      });
      break;
    default:
      sendMessagePrivate(message, 'You fail to describe that thing');
    }
  }

  updateNameInRoom(data) {
    updateRoomPopulace(data, this.player, this.type, this.description);
  }
}

module.exports = Describe;