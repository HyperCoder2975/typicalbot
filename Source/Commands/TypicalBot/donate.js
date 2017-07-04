const Command = require("../../Structures/Command.js");
const MessageEmbed = require("discord.js").MessageEmbed;

module.exports = class extends Command {
    constructor(client, filePath) {
        super(client, filePath, {
            name: "donate",
            description: "Donate to the cause of TypicalBot.",
            usage: "donate",
            dm: true,
            mode: "strict"
        });

        this.client = client;
    }

    execute(message, response, permissionLevel) {
        response.send(`**Donations can be sent here:** <${this.client.config.urls.donate}>\n\nDonations go to the creator of TypicalBot for any finances.`);
    }

    embedExecute(message, response){
        const embed = new MessageEmbed()
            .setColor(0x00ADFF)
            .setTitle("Donate to TypicalBot's Creator")
            .setDescription(`You can donate to TypicalBot's creator [here](${this.client.config.urls.donate}>).\n\nDonations go to the creator of TypicalBot for any finances.`)
            .setFooter("TypicalBot", "https://typicalbot.com/images/icon.png")
            .setTimestamp();

        response.embed(embed);
    }
};
