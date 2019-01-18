const commando = require('discord.js-commando');

var entryRoomRole;
var room0Role;
var room1Role;
var room2Role;

class MoveCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'move',
            group: 'mud',
            memberName: 'move',
            description: 'Moves the user to a different room (i.e. text channel)',
            args: [
                {
                    key: 'room',
                    prompt: 'which room do you wish to move to?',
                    type: 'string'
                }
            ]
        });
    }

    async run(message, { room }) {
        this.initializeRoomRoles(message);

        /*
        let membersWithRole = role.members;
        console.log(`Got ${membersWithRole.size} members with that role.`);
        */

        let member = message.member;

        if (message.channel.name === "entry-room") {
            if (room === "room-0") {
                message.reply("moved to \<#530099456645791748>");
                member.setRoles([room0Role]).catch(console.error);
            }
            else {
                message.reply("Sorry, I don't see a room like that.");
            }
        }
        else if (message.channel.name === "room-0") {
            if (room === "entry-room") {
                message.reply("moved to \<#530099209614000159>");
                member.setRoles([entryRoomRole]).catch(console.error);
            }
            else if (room === "room-1") {
                message.reply("moved to \<#530099492091985921>");
                member.setRoles([room1Role]).catch(console.error);
            }
            else {
                message.reply("Sorry, I don't see a room like that.");
            }
        }
        else if (message.channel.name === "room-1") {
            if (room === "room-0") {
                message.reply("moved to \<#530099456645791748>");
                member.setRoles([room0Role]).catch(console.error);
            }
            else if (room === "room-2") {
                message.reply("moved to \<#530099522940960799>");
                member.setRoles([room2Role]).catch(console.error);
            }
            else {
                message.reply("Sorry, I don't see a room like that.");
            }
        }
        else if (message.channel.name === "room-2") {
            if (room === "room-1") {
                message.reply("moved to \<#530099492091985921>");
                member.setRoles([room1Role]).catch(console.error);
            }
            else {
                message.reply("Sorry, I don't see a room like that.");
            }
        }
        else {
            message.reply("You're not inside of the MUD-sanctioned rooms.");
        }
        
        // message.channel.send("I'm sorry. I don't have any legs yet.");
    }

    initializeRoomRoles(message) {
        entryRoomRole = message.guild.roles.find(role => role.name === "entry-room");
        room0Role = message.guild.roles.find(role => role.name === "room-0");
        room1Role = message.guild.roles.find(role => role.name === "room-1");
        room2Role = message.guild.roles.find(role => role.name === "room-2");
    }
}

module.exports = MoveCommand;