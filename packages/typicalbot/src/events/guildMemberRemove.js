const { Collection } = require('discord.js');
const Event = require('../structures/Event');

class GuildMemberRemove extends Event {
    constructor(...args) {
        super(...args);
    }

    async execute(member) {
        if (!member.guild.available) return;

        const { guild } = member;

        const bans = await guild.fetchBans().catch(() => { });
        if (bans instanceof Collection && bans.has(member.id)) return;

        const settings = await this.client.settings.fetch(guild.id);
        if (!settings.logs.id || settings.logs.leave === '--disabled') return;

        const { user } = member;

        if (!guild.channels.has(settings.logs.id)) return;
        const channel = guild.channels.get(settings.logs.id);
        if (channel.type !== 'text') return;

        if (settings.logs.leave === '--embed') {
            channel.buildEmbed()
                .setColor(0xFF6600)
                .setAuthor(`${user.tag} (${user.id})`, user.avatarURL() || null)
                .setFooter('User Left')
                .setTimestamp()
                .send()
                .catch(() => { });
        } else {
            channel.send(
                settings.logs.leave
                    ? this.client.functions.formatMessage('logs', guild, user, settings.logs.leave)
                    : `**${user.tag}** has left the server.`,
            ).catch(() => { });
        }
    }
}

module.exports = GuildMemberRemove;
