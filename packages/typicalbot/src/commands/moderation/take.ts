import Command from '../../structures/Command';
import Constants from '../../utility/Constants';
import { TypicalGuildMessage } from '../../types/typicalbot';

const regex = /(?:(?:(?:<@!?)?(\d{17,20})>?)|(?:(.+)#(\d{4})))?(?:\s+)?(?:(?:<@&)?(\d{17,20})>?|(.+))/i;

export default class extends Command {
    mode = Constants.Modes.STRICT;

    async execute(message: TypicalGuildMessage, parameters: string) {
        const args = regex.exec(parameters);
        if (!args)
            return message.error(
                message.translate('misc:USAGE_ERROR', {
                    name: this.name,
                    prefix: this.client.config.prefix
                })
            );
        args.shift();

        const [id, username, discriminator, roleID, roleName] = args;
        const permissions = await message.member.fetchPermissions(true);

        const member = await this.client.helpers.resolveMember.execute(
            message,
            id,
            username,
            discriminator,
            false
        );

        const role = roleID
            ? message.guild.roles.get(roleID)
            : roleName
            ? message.guild.roles.find(r => r.name.toLowerCase() === roleName)
            : null;
        if (!role)
            return message.error(message.translate('moderation/give:INVALID'));
        if (!role.editable)
            return message.error(
                message.translate('moderation/take:UNEDITABLE')
            );

        if (member) {
            if (
                permissions.level <
                Constants.PermissionsLevels.SERVER_ADMINISTRATOR
            ) {
                return message.error(
                    this.client.helpers.permissionError.execute(
                        message,
                        this,
                        permissions
                    )
                );
            }

            const removed = await member.roles.remove(role).catch(() => null);
            if (!removed)
                return message.error(message.translate('common:REQUEST_ERROR'));

            return message.reply(message.translate('common:SUCCESS'));
        } else {
            const publicList = message.guild.settings.roles.public;
            if (!publicList.includes(role.id))
                return message.error(
                    message.translate('moderation/give:NOT_PUBLIC')
                );

            const removed = await message.member.roles
                .remove(role)
                .catch(() => null);
            if (!removed)
                return message.error(message.translate('common:REQUEST_ERROR'));

            return message.reply(message.translate('common:SUCCESS'));
        }
    }
}
