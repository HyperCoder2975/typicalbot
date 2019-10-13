import { inspect } from 'util';
import Constants from '../utility/Constants';
import Event from '../structures/Event';
import { TypicalGuildMessage } from '../types/typicalbot';

const regex = /(https:\/\/)?(www\.)?(?:discord\.(?:gg|io|me|li)|discordapp\.com\/invite)\/([a-z0-9-.]+)?/i;

export default class MessageUpdate extends Event {
    async execute(
        _oldMessage: TypicalGuildMessage,
        message: TypicalGuildMessage
    ) {
        if (
            message.partial ||
            message.channel.type !== 'text' ||
            message.author.bot ||
            !message.guild ||
            !message.guild.available
        )
            return;

        const settings = (message.guild.settings = await message.guild.fetchSettings());

        const userPermissions = await this.client.handlers.permissions.fetch(
            message.guild,
            message.author.id
        );

        if (userPermissions.level >= 2) return;
        if (settings.ignored.invites.includes(message.channel.id)) return;

        if (
            userPermissions.level <
                Constants.PermissionsLevels.SERVER_MODERATOR &&
            !settings.ignored.invites.includes(message.channel.id)
        ) {
            this.inviteCheck(message);
        }
    }

    inviteCheck(message: TypicalGuildMessage) {
        if (message.guild.settings.automod.invite) {
            if (
                regex.test(message.content) ||
                regex.test(inspect(message.embeds, { depth: 4 }))
            )
                this.client.emit('guildInvitePosted', message);
        }
    }
}
