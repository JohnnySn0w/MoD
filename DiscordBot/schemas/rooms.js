module.exports = [
    {
        "name": "",
        "id": "",
        "description": "",
        "exits": {
            
        },
        "items": {
            
        },
        "npcs": [

        ],
        "enemies": [

        ]
    },
    {
        "name": "entry-room",
        "id": "542123382800515072",
        "roleid": "530096793422266428",
        "description": "You're in a large, cavernous room. Your footsteps echo into the darkness. Your journey begins to the north... \nThere's also an old-man and a little-boy in the room with you.",
        "exits": {
            "north": "room-0"
        },
        "items": [

        ],
        "npcs": {
            "old-man": "1",
			"little-boy": "2"
        },
        "enemies": [

        ]
    },
    {
        "name": "room-0",
        "id": "542123610865664000",
        "roleid": "530097563748139028",
        "description": "The cave walls narrow in and create a hallway of sorts. The hallways comes to a split where the west path leads to light while the east path leads to a pile of rocks. To the south is a large room.",
        "exits": {
            "west": "room-1",
            "south": "entry-room"
        },
        "items": {
            "boulders": 2,
            "rocks": 2,
        },
        "npcs": [

        ],
        "enemies": [

        ]
    },
    {
        "name": "room-1",
        "id": "530099492091985921",
        "roleid": "530097609428172801",
        "description": "The roomly is oddly shaped like a perfect cube. The stone walls are completely smooth. On the far wall, there's ladder. To the east is a hallway.",
        "exits": {
            "up": "room-2",
            "east": "room-0"
        },
        "items": {
            "ladder": 1,
        },
        "npcs": [

        ],
        "enemies": [

        ]
    },
    {
        "name": "room-2",
        "id": "530099522940960799",
        "roleid": "530097635449634828",
        "description": "Light floods your eyes as you arrive at the surface. There seems to only be flat grasses for miles. Only the ladder at your feet breaks up the landscape.",
        "exits": {
            "down": "room-1"
        },
        "items": {
            "ladder": 0,
        },
        "npcs": [

        ],
        "enemies": [

        ]
    },
]