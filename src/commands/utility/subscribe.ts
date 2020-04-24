import { MessageEmbed } from 'discord.js';
import { Modes, Links } from '../../lib/utils/constants';
import Command from '../../structures/Command';
import { TypicalGuildMessage } from '../../types/typicalbot';

export default class extends Command {
    mode = Modes.STRICT;

    async execute(message: TypicalGuildMessage) {
        const role = message.guild.settings.subscriber
            ? message.guild.roles.cache.get(message.guild.settings.subscriber)
            : null;

        if (!role)
            return message.error(message.translate('utility/subscribe:NONE'));

        const subbed = await message.member.roles.add(role).catch(() => null);
        if (!subbed) return null;

        if (!message.embeddable)
            return message.success(message.translate('utility/subscribe:SUBSCRIBED'));

        return message.send(new MessageEmbed()
            .setColor(0x00adff)
            .setTitle(message.translate('common:SUCCESS'))
            .setDescription(message.translate('utility/subscribe:SUBSCRIBED'))
            .setFooter('TypicalBot', Links.ICON)
            .setTimestamp());
    }
}
