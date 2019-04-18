![Image of the MUD DM](http://www.mahan.io/static/media/DMspritev3.png)
# MoD: MUD on Discord
### A wot?
For the uninitiated, a MUD is a Multi-User Dungeon. Think text-based adventure game, but as an online multiplayer game
### And you want to stick that on Discord?
Absolutely. Discord has some really neat functionality that would actually integrate pretty well with the structure of a general MUD. 
### How far is this going? Your own MUD, or can other people use it?
The license on this baby is copyleft af, anyone can use it, but they also have to copyleft it. So yeah, the dream is to make a modular bot that can take hand-crafted modules of code and run a MUD with them. This bot is merely the skeleton on which to drape the flesh of world-building.
### In 6 months??
Granted, we'll predominantly work on just making it a single use MUD, but hopefully be able to make sure tidbits have enough modularity that someone else could add-on to it, or even do their own thing.
### Ok. How do I run it?
See the Setup section of the wiki!

___

## Features thus far:

### Basic demo dungeon
This is the basic framework for a dungeon, and serves as a short example of what can be done at a simple level.

### Administrative commands
- db – allows for simple queries to the database, as well as functionality for on-the-fly creation of game elements
- test – in-house manufactured unit testing

### Player commands
- Look – returns a description of items, rooms, npcs, enemies, 
- Move – change rooms in the mud, which is an automated channel switch
- Attack – specify a target, and get whackin'
- Stats – get a pm of current player stats
- Talk – chat it up with an npc

### Prospective future features:
- Automated generation of channels for game rooms from database entries
- Custom player descriptions for RP
- Change nickname for RP
- Player housing
