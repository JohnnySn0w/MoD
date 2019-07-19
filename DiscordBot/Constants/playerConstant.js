module.exports.PLAYER_CONSTANT = (message) => {
  return {
    characterName: `${message.author && message.author.nickname ? message.author.nickname : message.author.username}`,
    description: 'just another person',
    id: `${message.author.id}`,
    currentRoomID: 'a-journey-begins',
    hearth: 'village-square',
    emoji: 'bust_in_silhouette',
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