const Command = require('../../structures/Command');

const Constants = require('../../utility/Constants');

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            description: "Send an announcement to the announcements channel. Use the flag '-e' before your content to make the message an embed. If the announcements mention role is set, it will always use it.",
            usage: "announce ['-e'] <content>",
            permission: Constants.Permissions.Levels.SERVER_ADMINISTRATOR,
            mode: Constants.Modes.STRICT,
        });
    }

    execute(message, parameters) {
        const args = /(?:(-e)\s+)?((?:.|[\r\n])+)/i.exec(parameters);
        if (!args) return message.error('No announcement content was supplied.');

        const embed = args[1]; const
            content = args[2];

        const toChannel = message.guild.channels.get(message.guild.settings.announcements.id);
        if (!toChannel) return message.error('To announce, please set up an announcement channel by typing: `$set edit announcements #channel-name`');

        const mentionRole = message.guild.roles.get(message.guild.settings.announcements.mention);

        embed
            ? toChannel.buildEmbed(mentionRole ? mentionRole.toString() : '').setColor(0x00adff).setTitle('Announcement').setDescription(content)
                .setFooter(message.author.tag, message.author.avatarURL() || null)
                .send(`${mentionRole ? mentionRole.toString() : ''}`, { disableEveryone: false })
            : toChannel.send(`**__Announcement from ${message.author.username}#${message.author.discriminator}:__**${mentionRole ? ` ${mentionRole.toString()}` : ''}\n\n${content}`, { disableEveryone: false });
    }
};
