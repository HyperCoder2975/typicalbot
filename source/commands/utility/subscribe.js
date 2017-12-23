const Command = require("../../structures/Command");

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            description: "Gain the server's subscriber role.",
            usage: "subscribe",
            mode: "strict"
        });
    }

    execute(message, parameters, permissionLevel) {
        let role = message.guildSettings.subscriber ? message.guild.roles.get(message.guildSettings.subscriber) : null;
        if (message.guild.id === "163038706117115906") role = message.guild.roles.find("name", "Subscriber");

        if (!role) return message.error("No subscriber role is set up for this server.");

        message.member.addRole(role).then(() => {
            message.reply("You are now subscribed!");
        });
    }

    embedExecute(message, parameters, permissionLevel) {
        let role = message.guildSettings.subscriber ? message.guild.roles.get(message.guildSettings.subscriber) : null;
        if (message.guild.id === "163038706117115906") role = message.guild.roles.find("name", "Subscriber");

        if (!role) return message.buildEmbed()
            .setColor(0xFF0000)
            .setTitle("Error")
            .setDescription(`No subscriber role is set up for this server.`)
            .setFooter("TypicalBot", "https://typicalbot.com/x/images/icon.png")
            .setTimestamp()
            .send();

        const Role = message.guild.roles.find("name", "Subscriber");

        message.member.addRole(role).then(() => {
            message.buildEmbed()
                .setColor(0x00adff)
                .setTitle("Success")
                .setDescription("You are now subscribed!")
                .setFooter("TypicalBot", "https://typicalbot.com/x/images/icon.png")
                .setTimestamp()
                .send();
        });
    }
};
