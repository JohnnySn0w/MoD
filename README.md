
<p align="center">
  <img height=auto width=25% src="https://github.com/JohnnySn0w/MoD/blob/master/sprites/dm.png" alt="Dungeon Master"/>
</p>


<div height=auto width=2em>
  <h1 align="center">MoD: MUD on Discord<p></p></h1>
</div>
<a href="https://codeclimate.com/github/JohnnySn0w/MoD/maintainability"><img src="https://api.codeclimate.com/v1/badges/1901d2aed01ef57e9384/maintainability" /></a>

### A hosted instance is accessible here:
~~https://discord.gg/KqJrvph~~
the server still exists, however the bot is in a state of disrepair, and I have moved on to other projects.
## About
For the uninitiated, a MUD is a Multi-User Dungeon. Think text-based game, but as an online multiplayer game

The goal of the bot is to take hand-crafted game modules and run a MUD with them. A skeleton on which to drape the flesh of world-building.

## How do I run an instance?
See the Setup section of the wiki


## Brief Usage Overview
A player needs to first join a server where the bot is running, then use the Start command. At that point, the bot will make an entry in the database for that user, and from then on, the user can DM the bot directly, which allows for the simulation of a terminal style environment inside of Discord. 

There are some interesting implications here. People can join the same game instance through different servers(as long as the same bot instance is on those different servers), and this allows disparate user groups to interact in the game world, while also maintaining privacy.

Due to how discord bot DMs work, users must remain part of a server hosting the bot instance to continue playing in the same game world.

___

## Features thus far:

### Basic demo dungeon
- This is the basic framework for a dungeon, and serves as a short example of what can be done at a simple level. It can easily be replaced with whatever your actual world is.

### Administrative commands (only available to the bot instance owner)
- db – allows for simple queries to the database, as well as functionality for on-the-fly creation of game elements
- notbusy - a short-term fix for a higher level problem, fixes a player's busy status if the bot gets interrupted. Will be removed in the future when the true solution is implemented.

### Player commands
##### a lot these commands have aliases, so players can guess around and still manage to trigger them
- Connect/Disconnect - sets the player to an online/offline state, which prevents pings and messages while offline
- Look – returns a description of items, rooms, npcs, enemies, 
- Move – change rooms in the mud
- Attack – specify a target, and get whackin'
- Stats – get a readout of current player stats
- Talk – chat it up with an npc
- Item - equip, uneqip, or discard an item
- Help - display available commands and syntax
- Inventory - get a readout of your inventory
- Describe - set character description and name
- Say - inter-player communication at a room level, will relay a message to all other players in a room

### Effects system
- allows for the creation and implementation of effects for items, spells, and so on.

### Prospective future features:
- Player housing
- magic system

___

I'd like to give a big thanks to the original senior project group who worked with me in getting this thing started:
Eric Ortiz, Samantha Santiago, Olivia Spears, Christopher Boquet, and Elijah Jefferson. You guys helped make my crazy idea a reality, and I'm really glad to have worked with you on it.
