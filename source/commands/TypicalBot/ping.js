const Command = require("../../structures/Command");

module.exports = class extends Command {
    constructor(client, name) {
        super(client, name, {
            description: "A check to see if TypicalBot is able to respond.",
            usage: "ping",
            dm: true,
            mode: "strict"
        });
    }

    async execute(message, response, permissionLevel) {
        const msg = await response.send("Pinging...");
        msg.edit(`Command Execution Time : ${msg.createdTimestamp - message.createdTimestamp}ms | Discord API Latency : ${Math.floor(this.client.pings[0])}ms`);
    }
};
