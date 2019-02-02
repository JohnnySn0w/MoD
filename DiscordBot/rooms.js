module.exports = [
    {
        "name": "",
        "id": "",
        "description": "",
        "exits": [
            
        ],
        "items": [

        ],
        "npcs": [

        ],
        "enemies": [

        ]
    },
    {
        "name": "entry-room",
        "id": "530099209614000159",
        "description": "You're in a large, cavernous room. Your footsteps echo into the darkness. This is where your journey begins.",
        "exits": [
            {"north": "room-0"}
        ],
        "items": [

        ],
        "npcs": [

        ],
        "enemies": [

        ]
    },
    {
        "name": "room-0",
        "id": "530099456645791748",
        "description": "The cave walls narrow in and create a hallway of sorts. The hallways comes to a split where the left path leads to light while the right path leads to a pile of rocks.",
        "exits": [
            {"west": "room-1"}
        ],
        "items": [
            {
                "name": "boulders",
                "description": "A large pile of imposing boulders block your path westward. It's no use trying to move them.",
                "interactive": false,
            }
        ],
        "npcs": [

        ],
        "enemies": [

        ]
    },
    {
        "name": "room-1",
        "id": "530099492091985921",
        "description": "The roomly is oddly shaped like a perfect cube. The stone walls are completely smooth. On the far wall, there's ladder.",
        "exits": [
            {"up": "room-2"}
        ],
        "items": [
            {
                "name": "ladder",
                "description": "It's a wooden ladder with rungs perfectly spaced. The ladder itself is afixed to the wall and seems to lead upwards.",
                "interactive": false,
            }
        ],
        "npcs": [

        ],
        "enemies": [

        ]
    },
    {
        "name": "room-2",
        "id": "530099522940960799",
        "description": "Light floods your eyes as you arrive at the surface. There seems to only be flat grasses for miles. Only the ladder at your feet breaks up the landscape.",
        "exits": [
            {"down": "room-1"}
        ],
        "items": [
            {
                "name": "ladder",
                "description": "It's a wooden ladder that rises up from a perfectly square hole. It seems to lead downward.",
                "interactive": false,
            }
        ],
        "npcs": [

        ],
        "enemies": [

        ]
    },
]