module.exports = [
    {
        "name": "Goblin",
        "id": 0,
        "level": 0,
        "health": 20,
        "strength": 3,
        "defense": 2,
        "description": "A green, humanoid monster stands before you with a small club in his hand.",
        "responses": {
        },
        "options": {
        },
        "hostile": true,
        "loot": [
        ]
    },
    {
        "name": "Old Man",
        "id": 1,
        "level": 0,
        "health": 10,
        "strength": 1,
        "defense": 2,
        "description": "He's bent over and seems to be upset about something...",
        "responses": {
            "0": {
                "0": "I'm so old!\n[0] Ask what's wrong\n[1] Ask where you are"
            },
            "1": {
                "0": "My back hurts because I'm so OLD!",
                "1": "I don't know! My back hurts so bad.",
            }
        },
        "options": {
            "0": [
                "[0] Ask what's wrong.",
                "[1] Ask where you are"
            ]
        },
        "hostile": false,
        "loot": [
        ]
    }, 
    {
        "name": "Little Boy",
        "id": 1,
        "level": 0,
        "health": 10,
        "strength": 3,
        "defense": 1,
        "description": "It seems like he's a little boy.",
        "responses": {
            "0": {
                "0": "I'm a little boy!"
            },
            "1": {
                "0": "I'm so great! I'm a little boy!",
                "1": "How would I know? I'm a little boy!",
            }
        },
        "options": {
            "0": [
                "[0] Ask how is he",
                "[1] Ask where you are"
            ]
        },
        "hostile": false,
        "loot": [
        ]
    }
]