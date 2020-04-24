import { TextChannel } from 'discord.js';
import { Modes, PermissionsLevels, ModerationLogTypes } from '../../lib/utils/constants';
import Command from '../../structures/Command';
import { TypicalGuildMessage } from '../../types/typicalbot';

const regex = /(?:(?:<@!?(\d{17,20})>|(\d{17,20})|<@&(\d{17,20})>|<#(\d{17,20})>|(you|me|bots))\s+)?(\d+)(?:\s+((?:.|[\r\n])+))?/i;

export default class extends Command {
    aliases = ['prune'];
    permission = PermissionsLevels.SERVER_MODERATOR;
    mode = Modes.STRICT;

    async execute(message: TypicalGuildMessage, parameters: string) {
        const args = regex.exec(parameters);
        if (!args)
            return message.error(message.translate('misc:USAGE_ERROR', {
                name: this.name,
                prefix: this.client.config.prefix
            }));
        args.shift();

        const [
            userMention,
            userID,
            roleID,
            channelID,
            filter,
            amount,
            reason
        ] = args;

        let messageCount = parseInt(amount, 10);
        if (messageCount > 100) messageCount = 100;
        if (messageCount < 2)
            return message.error(message.translate('moderation/purge:TOO_LITTLE'));

        let channelToUse = message.guild.channels.cache.get(channelID) as TextChannel;
        if (!channelToUse || channelToUse.type !== 'text')
            channelToUse = message.channel;

        let messages = await channelToUse.messages.fetch({
            limit: 100,
            before: message.id
        });

        messages = messages.filter((msg) => {
            if ([userMention, userID].includes(msg.author.id)) return true;
            if (msg.member?.roles.cache.has(roleID)) return true;
            if (filter === 'me' && msg.author.id === message.author.id)
                return true;
            if (filter === 'you' && msg.author.id === this.client.config.id)
                return true;
            if (filter === 'bots' && msg.author.bot) return true;
            return !userMention &&
                !userID &&
                !roleID &&
                !channelID &&
                !filter &&
                !reason;
        });

        const messagesToDelete = messages.array().splice(0, messageCount);

        const purged = await channelToUse
            .bulkDelete(messagesToDelete, true)
            .catch(() => null);

        if (!purged)
            return message.error(message.translate('moderation/purge:MISSING_PERMS'));

        if (
            message.guild.settings.logs.moderation &&
            message.guild.settings.logs.purge
        ) {
            const newCase = await message.guild.buildModerationLog();
            newCase
                .setAction(ModerationLogTypes.PURGE)
                .setModerator(message.author)
                .setChannel(channelToUse);
            if (reason) newCase.setReason(reason);
            await newCase.send();
        }

        if (!purged.size)
            await message.reply(message.translate('moderation/purge:NONE'));
        else {
            const response = await message.reply(message.translate(purged.size === 1
                ? 'moderation/purge:PURGED'
                : 'moderation/purge:PURGED_MULTIPLE', { amount: purged.size }));
            response.delete({ timeout: 2500 }).catch(() => null);
        }

        return message.delete({ timeout: 2500 }).catch(() => null);
    }
}
