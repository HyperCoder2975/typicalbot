import { TypicalGuildMessage } from "../../types/typicalbot";
import * as moment from 'moment';
import Command from '../../structures/Command';
import Constants from '../../utility/Constants';
import { MessageEmbed } from 'discord.js';

export default class extends Command {
    aliases = ['sinfo'];
    mode = Constants.Modes.STRICT;

    async execute(message: TypicalGuildMessage) {
        const guildOwner = await this.client.users.fetch(message.guild.ownerID).catch(() => null);
        const UNKNOWN = message.translate('common:USER_FETCH_ERROR');

        if (!message.embedable) return message.reply([
            message.translate('serverinfo:SERVER', { name: message.guild.name }),
            '```',
            message.translate('serverinfo:NAME', { name: message.guild.id, id: message.guild.id }),
            message.translate('serverinfo:OWNER', { users: guildOwner ? guildOwner.tag : UNKNOWN, id: message.guild.ownerID }),
            message.translate('serverinfo:CREATED', { time: moment(message.guild.createdAt).format('dddd MMMM Do, YYYY, hh:mm A') }),
            message.translate('serverinfo:REGION', { region: message.guild.region }),
            message.translate('serverinfo:VERIFICATION', { level: message.guild.verificationLevel }),
            message.translate('serverinfo:ICON', { url: message.guild.iconURL({ format: 'png', size: 2048 }) || message.translate('common:NONE') }),
            message.translate('serverinfo:CHANNELS', { amount: message.guild.channels.size }),
            message.translate('serverinfo:MEMBERS', { amount: message.guild.memberCount }),
            message.translate('serverinfo:ROLES', { amount: message.guild.roles.size }),
            message.translate('serverinfo:EMOJIS', { amount: message.guild.emojis.size }),
            message.translate('serverinfo:BOOSTED', { level: message.guild.premiumTier, amount: message.guild.premiumSubscriptionCount })
            + '```',
        ].join('\n')
        );

        return message.send(new MessageEmbed()
            .setColor(0x00ADFF)
            .setTitle(message.translate('serverinfo:INFO'))
            .addField(message.translate('common:NAME_FIELD'), message.guild.name, true)
            .addField(message.translate('common:ID_FIELD'), message.guild.id, true)
            .addField(message.translate('common:OWNER_FIELD'), `${guildOwner ? guildOwner.tag : UNKNOWN}\n${message.guild.ownerID}`, true)
            .addField(message.translate('common:CREATED_FIELD'), `${moment(message.guild.createdAt).format('dddd MMMM Do, YYYY')}\n${moment(message.guild.createdAt).format('hh:mm A')}`, true)
            .addField(message.translate('common:REGION_FIELD'), message.guild.region.toUpperCase(), true)
            .addField(message.translate('common:VERIFICATION_FIELD'), message.guild.verificationLevel, true)
            .addField(message.translate('common:CHANNELS_FIELD'), message.guild.channels.size, true)
            .addField(message.translate('common:MEMBERS_FIELD'), message.guild.memberCount, true)
            .addField(message.translate('common:ROLES_FIELD'), message.guild.roles.size, true)
            .addField(message.translate('common:EMOJIS_FIELD'), message.guild.emojis.size, true)
            .addField(message.translate('common:BOOSTED_FIELD'), message.translate('serverinfo:BOOSTERS', { level: message.guild.premiumTier, amount: message.guild.premiumSubscriptionCount }))
            .setThumbnail(message.guild.iconURL({ format: 'png', size: 2048 }) || '')
            .setFooter('TypicalBot', Constants.Links.ICON)
        )
    }

};
