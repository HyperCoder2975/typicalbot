const Command = require("../../Structures/Command.js");
const MessageEmbed = require("discord.js").MessageEmbed;

module.exports = class extends Command {
    constructor(client, filePath) {
        super(client, filePath, {
            name: "subscribe",
            description: "Subscribe to TypicalBot's announcements.",
            usage: "subscribe",
            mode: "strict"
        });

        this.client = client;
    }

    execute(message, response, permissionLevel) {
        if (message.guild.id !== "163038706117115906") return response.error(`You must be in TypicalBot's Lounge in order to use this command.`);

        const Role = message.guild.roles.find("name", "Subscriber");

        message.member.addRole(Role).then(() => {
            response.reply("You are now subscribed to TypicalBot's announcements!");
        });
    }

    embedExecute(message, response, permissionLevel) {
        const fail = new MessageEmbed()
        .setColor(0xFF0000)
        .setTitle("Error")
        .setDescription(`You must be in TypicalBot's Lounge in order to use this command.`)
        .setFooter("TypicalBot", "https://typicalbot.com/images/icon.png")
        .setTimestamp();

        const success = new MessageEmbed()
        .setColor(0x00adff)
        .setTitle("Success")
        .setDescription("You are now subscribed to TypicalBot's announcements!")
        .setFooter("TypicalBot", "https://typicalbot.com/images/icon.png")
        .setTimestamp();

        if (message.guild.id !== "163038706117115906") return response.embed(fail);

        const Role = message.guild.roles.find("name", "Subscriber");

        message.member.addRole(Role).then(() => {
            response.embed(success);
        });
    }
};
