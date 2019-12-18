// importing from other files
const commando = require('discord.js-commando');
const db = require('../../utilities/dbhandler');
const { sendMessagePrivate } = require('../../utilities/globals.js');

class Teleport extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'teleport',
      group: 'admin',
      ownerOnly: false,
      memberName: 'teleport',
      description: 'Moves character to specified location',
      //user permissions
      userPermissions: ['ADMINISTRATOR'],
      args: [
        {
          key: 'roomId',
          prompt: 'Makes the given player no longer busy',
          type: 'string'
        }
      ],
      aliases: ['tele', 'warp']
    });
    this.updateRoom = this.updateRoom.bind(this);
    this.state = {};
  }

  async run(message, { roomId }) {
    this.state.playerId = message.author.id;
    this.state.roomId = roomId;
    db.getItem(roomId, 'rooms', this.updateRoom);
    db.updateItem(message.author.id, ['currentRoomId'], [roomId], 'players', ()=>{
      sendMessagePrivate(message, `teleported to ${roomId}`);
    });
  }

  updateRoom(data) {
    const { playerId, roomId } = this.state;
    const playerList = JSON.parse(data.body).Item.players;

    console.log(roomId, playerList);
    if (playerList.includes(playerId)) {
      return null;
    }
    db.updateItem(roomId, ['players'], [[...playerList, playerId]], 'rooms');
  }
}

module.exports = Teleport;
