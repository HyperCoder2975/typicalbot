const Event = require("../structures/Event");

class New extends Event {
    constructor(client, name) {
        super(client, name);
    }

    async execute(member) {
        const guild = member.guild;

        const settings = await this.client.settingsManager.fetch(guild.id);

        const user = member.user;

        if (settings.logs.join !== "--disabled") {
            if (guild.channels.has(settings.logs.id)) {
                const channel = guild.channels.get(settings.logs.id);

                if (settings.logs.join === "--embed") {
                    channel.buildEmbed()
                        .setColor(0x00FF00)
                        .setAuthor(`${user.tag} (${user.id})`, user.avatarURL() || null)
                        .setFooter("User Joined")
                        .setTimestamp()
                        .send()
                        .catch(() => console.log("Missing Permissions"));
                } else {
                    channel.send(
                        settings.logs.join ?
                            this.client.functions.formatMessage("logs", guild, user, settings.logs.join) :
                            `**${user.username}#${user.discriminator}** has joined the server.`
                    ).catch(() => console.log("Missing Permissions"));
                }
            }
        }

        if (settings.auto.message && !user.bot) user.send(`**${guild.name}'s Join Message:**\n\n${this.client.functions.formatMessage("automessage", guild, user, settings.auto.message)}`).catch(() => console.log("Missing Permissions"));

        if (settings.auto.nickname) member.setNickname(this.client.functions.formatMessage("autonick", guild, user, settings.auto.nickname)).catch(() => console.log("Missing Permissions"));

        const autorole = this.client.functions.fetchAutoRole(guild, settings);
        if (autorole && autorole.editable) setTimeout(() =>
            member.addRole(autorole).then(() => {
                if (settings.auto.role.silent === "N" && settings.logs.id && guild.channels.has(settings.logs.id)) guild.channels.get(settings.logs.id).send(`**${user.tag}** was given the autorole **${autorole.name}**.`);
            }).catch(() => console.log("Missing Permissions")), settings.auto.role.delay || 2000
        );
    }
}

module.exports = New;
