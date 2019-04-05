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
                "reply": "Hello! I'm so old!",
                "prompts": [
					{
						"prompt":  "[0] Ask how he is",
						"progression": "1"
					}, 
					{
						"prompt":"[1] Ask where you are",
						"progression": "2"
					}
                ]
            },
            "1": {
                "reply": "My back hurts because I'm so OLD!",
                "prompts": [
					{
						"prompt": "[0] Say hello again",
						"progression": "0" 
					},
					{
						"prompt": "[1] Ask where you are",
						"progression": "2"
					},
					{
						"prompt": "[2] Offer him some ALEVE",
						"progression": "3"
					}
                ]
            },
            "2": {
                "reply": "I don't know! I'm old.",
                "prompts": [
					{
						"prompt": "[0] Say hello again", 
						"progression": "0"
					},
					{
						"prompt": "[1] Ask how he is", 
						"progression": "1"
					}
                ]
            },
			"3": {
				"reply": "Oh wow!!! Thank you so much!!\n\nThe old man puts the ALEVE in his pocket...",
				"prompts": [
					{
						"prompt": "[0] Say hello again",
						"progression": "4"
					}, 
					{
						"prompt": "[1] Ask how he is",
						"progression": "5"
					},
					{
						"prompt": "[2] Ask where you are",
						"progression": "6"
					}
				]
			},
			"4" : {
				"reply": "Hi there!!! I hope I feel better soon!!",
				"prompts": [
					{
						"prompt": "[0] Ask how he is",
						"progression": "5"
					},
					{
						"prompt": "[1] Ask where you are",
						"progression": "6"
					}
				]
			},
			"5" : {
				"reply": "My back feels better already!!!\n\n...You don't mention that the ALEVE is still in his pocket...",
				"prompts": [
					{
						"prompt": "[0] Say hello again",
						"progression": "4" 
					},
					{
						"prompt": "[1] Ask where you are",
						"progression": "6"
					}
				]
			},
			"6" : {
				"reply": "We're in a cave you silly goose!!!",
				"prompts": [
					{
						"prompt": "[0] Say hello again", 
						"progression": "4"
					},
					{
						"prompt": "[1] Ask how he is", 
						"progression": "5"
					}
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
                "reply": "Hello!!! I'm a little boy!",
                "prompts": [
                    {
                        "prompt": "[0] Ask how is he",
						"progression": "1"
                    },
                    {
                        "prompt": "[1] Ask where you are",
						"progression": "2"
                    }
                ]
            },
            "1": {
                "reply": "I'm so great! I'm a little boy!",
                "prompts": [
					{
                        "prompt": "[0] Say hello again",
						"progression": "0"
                    },
                    {
                        "prompt": "[1] Ask where you are",
						"progression": "2"
                    }
                ]
            },
            "2": {
                "reply": "How would I know? I'm a little boy!",
                "prompts": [
					{
                        "prompt": "[0] Say hello again",
						"progression": "0"
                    },
                    {
                        "prompt": "[1] Ask how he is",
						"progression": "1"
                    }
                ]
            }
        },
        "hostile": false,
        "loot": [
        ]
    }
]