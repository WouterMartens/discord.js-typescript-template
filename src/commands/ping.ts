import { Message } from "discord.js";

module.exports = {
    name: 'ping',
    description: 'Ping, pong',
    args: false,
    aliases: [],
    usage: 'ping',
    guildOnly: true,
    cooldown: 3,
	execute(message: Message, args: string[]) {
		message.channel.send('Pong.');
	},
};