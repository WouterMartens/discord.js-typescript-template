import { Client, Collection } from 'discord.js';
import fs from 'fs'; // File system
const { prefix, token, cooldown } = require('../config.json'); // Config file

const client: Client = new Client(); // Initialize client
// Uses the file system to read the commands folder and filter all the .js files
const commandFiles = fs.readdirSync('./commands').filter((file: string) => file.endsWith('.js'));

// Goes through all of the command files and adds them to the client instance
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.login(token); // Login to the client

const cooldowns = new Collection();

// Wait for the client to be ready
client.once('ready', () => {
    console.log('Ready!');
});

// When the client receives a new message
client.on('message', message => {
    // Checks if the message has the prefix and isn't made by a bot
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    // Pulls the command and the arguments from the message
    const args: string[] = message.content.slice(prefix.length).trim().split(/ +/);
    //@ts-ignore
    const commandName: string = args.shift()?.toLocaleLowerCase();

    console.log(commandName, args);

    // Checks if the command exists
    const command = client.commands.get(commandName) ||
        client.commands.find(cmd =>
            cmd.aliases &&
            cmd.aliases.includes(commandName));

    if (!command) return;

    // Checks if the command is allowed to be used in a direct message
    if (command.guildOnly && message.channel.type === 'dm') {
        return message.reply("I'm not allowed to execute that command inside a direct message");
    }

    // Checks if the command has arguments
    if (command.args && !args.length) {
        let reply = `${message.author}, you didn't provide any arguments`;
        if (command.usage) {
            reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
        }

        return message.channel.send(reply);
    }

    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Collection());
    }

    const now: number = Date.now();
    const timestamps: any = cooldowns.get(command.name);
    const cooldownAmount: number = (command.cooldown || cooldown) * 1000;

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`)
        }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try {
        // Execute the command
        if (commandName) {
            command.execute(message, args);
        }
    } catch (error) {
        console.error(error);
        message.reply('Erro!!');
    }
});

