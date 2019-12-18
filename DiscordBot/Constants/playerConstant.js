module.exports.PLAYER_CONSTANT = (message, startingRoom, defaultHearth, defaultDescription) => {
  return {
    characterName: `${message.author && message.author.nickname ? message.author.nickname : message.author.username}`,
    description: defaultDescription,
    id: `${message.author.id}`,
    currentRoomId: startingRoom,
    hearth: defaultHearth,
    emoji: '👤',
    isOnline: false,
    health: 100,
    maxhealth: 100,
    currentLevel: 1,
    strength: 7,
    defense: 5,
    experience: 0,
    nextLevelExperience: 100,
    inventory: {
      keys: {
      },
      items: {
      },
      gold: 200
    },
    equipment: {
      weapon: null,
      armor: null
    },
    busy: false
  };
};