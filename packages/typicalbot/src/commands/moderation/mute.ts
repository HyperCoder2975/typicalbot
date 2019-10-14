import Command from '../../structures/Command';
import Constants from '../../utility/Constants';
import { TypicalGuildMessage, PermissionLevel } from '../../types/typicalbot';
import { PermissionOverwrites, MessageEmbed } from 'discord.js';

const regex = /(?:(?:<@!?)?(\d{17,20})>?(?:\s+(?:(\d+)d(?:ays?)?)?\s?(?:(\d+)h(?:ours?|rs?)?)?\s?(?:(\d+)m(?:inutes?|in)?)?\s?(?:(\d+)s(?:econds?|ec)?)?)?(?:\s*(.+))?|(deny)\s+(?:(here)|(?:(?:<#)?(\d{17,20})>?)))/i;

export default class extends Command {
    permission = Constants.PermissionsLevels.SERVER_MODERATOR;
    mode = Constants.Modes.STRICT;

    async execute(
        message: TypicalGuildMessage,
        parameters: string,
        permissionLevel: PermissionLevel
    ) {
        const args = regex.exec(parameters);
        if (!args)
            return message.error(
                message.translate('misc:USAGE_ERROR', {
                    name: this.name,
                    prefix: this.client.config.prefix
                })
            );
        args.shift();

        const [
            userID,
            days,
            hours,
            minutes,
            seconds,
            reason,
            deny,
            useCurrentChannel,
            channelID
        ] = args;

        if (!message.guild.settings.roles.mute)
            return message.error(message.translate('moderation/mute:NO_ROLE'));
        const role = message.guild.roles.get(message.guild.settings.roles.mute);
        if (!role)
            return message.error(message.translate('moderation/mute:NO_ROLE'));

        if (deny) {
            const channel = useCurrentChannel
                ? message.channel
                : message.guild.channels.get(channelID);
            if (!channel)
                return message.error(
                    message.translate('moderation/mute:INVALID_CHANNEL')
                );

            const permissions = channel.permissionsFor(
                message.guild.me || this.client.config.id
            );

            if (permissions && !permissions.has('MANAGE_ROLES'))
                return message.error(
                    message.translate('moderation/mute:MISSING_PERMS')
                );

            const currentOverwrites = channel.permissionOverwrites;
            currentOverwrites.set(
                role.id,
                new PermissionOverwrites(channel, {
                    id: role.id,
                    deny: ['SEND_MESSAGES'],
                    allow: [],
                    type: 'role'
                })
            );

            const edited = await channel
                .overwritePermissions({
                    permissionOverwrites: currentOverwrites,
                    reason: message.translate('moderation/mute:DENYING')
                })
                .catch(() => null);

            return edited
                ? message.success(message.translate('moderation/mute:DENYING'))
                : message.error(
                      message.translate('moderation/mute:DENY_ERROR')
                  );
        }

        // Mute a member
        const time =
            (60 * 60 * 24 * (days ? Number(days) : 0) +
                60 * 60 * (hours ? Number(hours) : 0) +
                60 * (minutes ? Number(minutes) : 0) +
                (seconds ? Number(seconds) : 0)) *
            1000;

        if (time > 1000 * 60 * 60 * 24 * 7)
            return message.error(message.translate('moderation/mute:TOO_LONG'));

        const member = await message.guild.members
            .fetch(userID)
            .catch(() => null);
        if (!member)
            return message.error(message.translate('common:USER_NOT_FOUND'));

        if (member.roles.has(message.guild.settings.roles.mute))
            return message.error(
                message.translate('moderation/mute:ALREADY_MUTED')
            );

        if (
            message.member.roles.highest.position <=
                member.roles.highest.position &&
            (permissionLevel.level !== 4 && permissionLevel.level < 9)
        )
            return message.error(message.translate('moderation/mute:TOO_LOW'));

        if (!role.editable)
            return message.error(
                message.translate('moderation/mute:UNEDITABLE')
            );

        const embed = new MessageEmbed()
            .setColor(Constants.ModerationLogTypes.MUTE.hex)
            .setFooter('TypicalBot', Constants.Links.ICON)
            .setTitle(message.translate('common:ALERT_SYSTEM'))
            .setDescription(
                message.translate('moderation/mute:MUTED', {
                    name: message.guild.name
                })
            )
            .addField(
                message.translate('common:MODERATOR_FIELD'),
                message.author.tag
            );
        if (reason)
            embed.addField(message.translate('common:REASON_FIELD'), reason);
        member.send().catch(() => null);

        const muted = await member.roles.add(role).catch(() => null);
        if (!muted)
            return message.error(message.translate('moderation/mute:ERROR'));

        if (message.guild.settings.logs.moderation) {
            const newCase = await message.guild.buildModerationLog();
            newCase
                .setExpiration(time)
                .setAction(Constants.ModerationLogTypes.MUTE)
                .setModerator(message.author)
                .setUser(member.user);
            if (reason) newCase.setReason(reason);
            newCase.send();
        }

        if (time)
            this.client.handlers.tasks.create('unmute', Date.now() + time, {
                guildID: message.guild.id,
                memberID: member.id
            });

        return message.success(
            message.translate('moderation/mute:SUCCESS', {
                user: message.author.tag
            })
        );
    }
}
