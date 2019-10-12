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

        if (!message.embedable)
            return message.reply(
                [
                    `**__${user.tag}__**`,
                    '```',
                    message.translate('userinfo:ID', { id: member.id }),
                    message.translate('userinfo:STATUS', {
                        status: member.user.presence.status
                    }),
                    message.translate('userinfo:AVATAR', {
                        avatar: member.user.displayAvatarURL({
                            format: 'png',
                            size: 2048
                        })
                    }),
                    message.translate('userinfo:JOINED', {
                        time: moment(member.joinedAt as Date).format(
                            'MMM DD, YYYY hh:mm A'
                        )
                    }),
                    message.translate('userinfo:REGISTERED', {
                        time: moment(member.user.createdAt).format('')
                    }),
                    message.translate('userinfo:ROLES', {
                        roles:
                            member.roles.size > 1
                                ? member.roles
                                      .sort((a, b) => b.position - a.position)
                                      .map(role => role.name)
                                      .join(', ')
                                : message.translate('common:NONE')
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
                    message.translate('userinfo:ROLE_FIELD', {
                        amount: member.roles.size - 1
                    }),
                    member.roles.size > 1
                        ? member.roles
                              .sort((a, b) => b.position - a.position)
                              .map(role => role.toString())
                              .join(', ')
                        : message.translate('common:NONE')
                )
        );
    }
}