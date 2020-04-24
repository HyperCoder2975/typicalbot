import { MessageEmbed } from 'discord.js';
import { Modes, Links } from '../../lib/utils/constants';
import Command from '../../structures/Command';
import { TypicalGuildMessage } from '../../types/typicalbot';

export default class extends Command {
    mode = Modes.STRICT;

    async execute(message: TypicalGuildMessage) {
        await message.send(new MessageEmbed()
            .setColor(0x00adff)
            .setTitle(message.translate('help/perms:LEVELS'))
            .setURL(Links.BASE)
            .setDescription(message.translate('help/perms:VIEW_ALL', {
                prefix: this.client.config.prefix
            }))
            .addFields([
                {
                    name: message.translate('help/perms:BLACKLISTED'),
                    value: message.translate('help/perms:BLACKLISTED_VALUE')
                },
                {
                    name: message.translate('help/perms:MEMBER'),
                    value: message.translate('help/perms:MEMBER_VALUE')
                },
                {
                    name: message.translate('help/perms:MODERATOR'),
                    value: message.translate('help/perms:MODERATOR_VALUE')
                },
                {
                    name: message.translate('help/perms:ADMIN'),
                    value: message.translate('help/perms:ADMIN_VALUE')
                },
                {
                    name: message.translate('help/perms:OWNER'),
                    value: message.translate('help/perms:OWNER_VALUE')
                }
            ])
            .setFooter('TypicalBot', Links.ICON)
            .setTimestamp());
    }
}
