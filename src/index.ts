import fs from 'fs'; // File system
import Client from "./MyClient.js"; // Client adapter to add commands functionality
const { prefix, token } = require('../config.json'); // Config file

const client: Client = new Client(); // Initialize client
// Uses the file system to read the commands folder and filter all the .js files
const commandFiles = fs.readdirSync('./commands').filter((file: string) => file.endsWith('.js'));

// Goes through all of the command files and adds them to the client instance
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.login(token); // Login to the client

// Wait for the client to be ready
client.once('ready', () => {
    console.log('Ready!');
});

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args: string[] = message.content.slice(prefix.length).trim().split('/ +/');
    const command: string|undefined = args.shift()?.toLocaleLowerCase();

    if (command && !client.commands.has(command)) return;

    try {
        if (command) {
            client.commands.get(command).execute(message, args);
        }
    } catch (error) {
        console.error(error);
        message.reply('Erro!!');
    }
});

