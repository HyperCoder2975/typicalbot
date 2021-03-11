import * as Sentry from '@sentry/node';
import { TextChannel, MessageEmbed } from 'discord.js';
import Event from '../lib/structures/Event';
import { TypicalGuild, TypicalGuildMessage } from '../lib/types/typicalbot';
import { lengthen } from '../lib/utils/util';
import { formatMessage } from '../lib/utils/util';

export default class MessageDelete extends Event {
    async execute(message: TypicalGuildMessage) {
        if (
            message.partial ||
            message.channel.type !== 'text' ||
            !message.guild ||
            !message.guild.available
        )
            return;

        const settings = await this.client.settings.fetch(message.guild.id);

        if (!settings.logs.id || !settings.logs.delete) return;

        const channel = message.guild.channels.cache.get(settings.logs.id) as TextChannel;
        if (!channel || channel.type !== 'text') return;

        const user = message.author;

        if (settings.logs.delete !== '--embed')
            return channel
                .send(settings.logs.delete === '--enabled'
                    ? message.translate('help/logs:DELETED', {
                        user: user.tag
                    })
                    // eslint-disable-next-line max-len
                    : await formatMessage('logs-msgdel', message.guild as TypicalGuild, user, settings.logs.delete, {
                        message,
                        channel: message.channel as TextChannel
                    }))
                .catch((err) => Sentry.captureException(err));

        return channel
            .send(new MessageEmbed()
                .setColor(0x3ea7ed)
                .setAuthor(`${user.tag} (${user.id})`, user.displayAvatarURL())
                .setDescription(lengthen(message.content, 100))
                .setFooter(message.translate('help/logs:MESSAGE_DELETED', {
                    channel: `<#${message.channel.id}>`,
                    id: message.channel.id
                }))
                .setTimestamp())
            .catch((err) => Sentry.captureException(err));
    }
}
