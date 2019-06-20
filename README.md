<img src="http://www.mahan.io/static/media/DMspritev3.png" height="64"/>

___

# MoD: MUD on Discord <a href="https://codeclimate.com/github/JohnnySn0w/MoD/maintainability"><img src="https://api.codeclimate.com/v1/badges/1901d2aed01ef57e9384/maintainability" /></a>
### A wot?
For the uninitiated, a MUD is a Multi-User Dungeon. Think text-based adventure game, but as an online multiplayer game
### And you stuck that on Discord?
Yeah, and man, rate limited messages per channel is a pain.
So yeah, the bot can take hand-crafted game modules and run a MUD with them. A skeleton on which to drape the flesh of world-building.
### Ok. How do I run it?
See the Setup section of the wiki!

___

## Features thus far:

### Basic demo dungeon
- This is the basic framework for a dungeon, and serves as a short example of what can be done at a simple level. It can easily be replaced with whatever your actual world is.

### Administrative commands
- db – allows for simple queries to the database, as well as functionality for on-the-fly creation of game elements
- gen - Automated generation of channels/roles for game rooms
- notbusy - a short-term fix for a higher level problem, fixes a player's busy status if the bot gets interrupted. Will be removed in the future when the true solution is implemented.

### Player commands
- Look – returns a description of items, rooms, npcs, enemies, 
- Move – change rooms in the mud
- Attack – specify a target, and get whackin'
- Stats – get a pm of current player stats
- Talk – chat it up with an npc
- Discard/Equip - discard or equip an item, respectively
- Help - display available commands and syntax
- Inventory - get a pm of your inventory
- Describe - set character description and name

### Prospective future features:
- Player housing


___

I'd like to give a big thanks to the original senior project group who worked with me in getting this thing started:
Eric Ortiz, Samantha Santiago, Olivia Spears, Christopher Boquet, and Elijah Jefferson. You guys helped make my crazy idea a reality, and I'm really glad to have worked with you on it.
