module.exports = [
    {
        "name": "Goblin",
        "id": "0",
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
        "id": "1",
        "level": 0,
        "health": 10,
        "strength": 1,
        "defense": 2,
        "description": "He's bent over and seems to be upset about something...",
        "responses": {
            "0": {
                "reply": "I'm so old!",
                "responses": [
                    {
                        "[0] Ask what's wrong": "1"
                    },
                    {
                        "[1] Ask where you are": "2"
                    }
                ]
            },
            "1": {
                "reply": "My back hurts because I'm so OLD!",
                "responses": [
                ]
            },
            "2": {
                "reply": "I don't know! My back hurts so bad.",
                "responses": [
                ]
            }
        },
        "hostile": false,
        "loot": [
        ]
    }, 
    {
        "name": "Little Boy",
        "id": "2",
        "level": 0,
        "health": 10,
        "strength": 3,
        "defense": 1,
        "description": "It seems like he's a little boy.",
        "responses": {
            "0": {
                "reply": "I'm a little boy!",
                "responses": [
                    {
                        "[0] Ask how is he": "1"
                    },
                    {
                        "[1] Ask where you are": "2"
                    }
                ]
            },
            "1": {
                "reply": "I'm so great! I'm a little boy!",
                "responses": [
                ]
            },
            "2": {
                "reply": "How would I know? I'm a little boy!",
                "responses": [
                ]
            }
        },
        "hostile": false,
        "loot": [
        ]
    }
]