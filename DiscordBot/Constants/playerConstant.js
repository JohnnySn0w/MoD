module.exports.PLAYER_CONSTANT = (message) => { 
    return {
    characterName: `${message.member.nickname ? message.member.nickname : message.member.user.username}`,
    description: "just another person",
    id: `${message.member.id}`,
    emoji: "bust_in_silhouette",
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
  }
}