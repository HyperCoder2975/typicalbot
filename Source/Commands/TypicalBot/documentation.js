const Command = require("../../Structures/Command.js");

module.exports = class extends Command {
    constructor(client, filePath) {
        super(client, filePath, {
            name: "documentation",
            description: "A check to see if TypicalBot is able to respond.",
            usage: "documentation",
            aliases: ["docs"],
            dm: true,
            mode: "strict"
        });

        this.client = client;
    }

    execute(message, response, permissionLevel) {
        response.send(`**Documentation can be found here:** <${this.client.config.urls.docs}>`);
    }

    embedExecute(message, response){
        response.buildEmbed()
            .setColor(0x00ADFF)
            .setTitle("TypicalBot Documentation")
            .setDescription(`**Documentation can be found here:** <${this.client.config.urls.docs}>`)
            .setFooter("TypicalBot", "https://typicalbot.com/images/icon.png")
            .setTimestamp()
            .send();
    }
};
