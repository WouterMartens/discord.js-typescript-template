import { Client, Collection } from "discord.js";

export default class MyClient extends Client {
    public commands: Collection<string, any>;
    /**
    * @param {ClientOptions} [options] Options for the client
*/
    constructor(options: any = {}) {
        super(Object.assign({ _tokenType: 'Bot' }, options));
        this.commands = new Collection();
    }
}