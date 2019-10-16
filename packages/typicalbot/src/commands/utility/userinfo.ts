import * as moment from 'moment';
import Command from '../../structures/Command';
import Constants from '../../utility/Constants';
import { TypicalGuildMessage } from '../../types/typicalbot';
import { MessageEmbed } from 'discord.js';

const regex = /(?:(?:(?:<@!?)?(\d{17,20})>?)|(?:(.+)#(\d{4})))?/i;

export default class extends Command {
    aliases = ['uinfo', 'whois'];
    mode = Constants.Modes.LITE;

    async execute(message: TypicalGuildMessage, parameters: string) {
        const args = regex.exec(parameters) || [];
        args.shift();
        const [id, username, discriminator] = args;
        const member = await this.client.helpers.resolveMember.execute(
            message,
            id,
            username,
            discriminator
        );
        if (!member) return message.translate('common:USER_NOT_FOUND');

        const user = member.user;

        const ROLES =
            member.roles.size > 1
                ? member.roles
                      .sort((a, b) => b.position - a.position)
                      .map(role => role.name)
                      .slice(0, -1)
                      .join(', ')
                : message.translate('common:NONE');

        if (!message.embedable)
            return message.reply(
                [
                    `**__${user.tag}__**`,
                    '```',
                    message.translate('utility/userinfo:ID', { id: member.id }),
                    message.translate('utility/userinfo:STATUS', {
                        status: member.user.presence.status
                    }),
                    message.translate('utility/userinfo:AVATAR', {
                        avatar: member.user.displayAvatarURL({
                            format: 'png',
                            size: 2048
                        })
                    }),
                    message.translate('utility/userinfo:JOINED', {
                        time: moment(member.joinedAt as Date).format(
                            'MMM DD, YYYY hh:mm A'
                        )
                    }),
                    message.translate('utility/userinfo:REGISTERED', {
                        time: moment(member.user.createdAt).format('')
                    }),
                    message.translate('utility/userinfo:ROLES', {
                        roles: ROLES
                    }),
                    '```'
                ].join('\n')
            );

        return message.send(
            new MessageEmbed()
                .setAuthor(
                    user.tag,
                    user.displayAvatarURL({ format: 'png', size: 2048 })
                )
                .setThumbnail(
                    user.displayAvatarURL({ format: 'png', size: 2048 })
                )
                .addField(message.translate('common:ID_FIELD'), user.id, true)
                .addField(
                    message.translate('common:STATUS_FIELD'),
                    user.presence.status,
                    true
                )
                .addField(
                    message.translate('common:JOINED_FIELD'),
                    moment(member.joinedAt as Date).format(
                        'MMM DD, YYYY hh:mm A'
                    ),
                    true
                )
                .addField(
                    message.translate('common:REGISTERED_FIELD'),
                    moment(user.createdAt).format('MMM DD, YYYY hh:mm A'),
                    true
                )
                .addField(
                    message.translate('utility/userinfo:ROLE_FIELD', {
                        amount: member.roles.size - 1
                    }),
                    ROLES
                )
        );
    }
}
