import { ClientUser } from 'discord.js';
import Task from '../lib/structures/Task';
import { UnmuteTaskData, TypicalGuild } from '../lib/types/typicalbot';
import { MODERATION_LOG_TYPE } from '../lib/utils/constants';

export default class extends Task {
    async execute(data: UnmuteTaskData): Promise<void> {
        const guild = this.client.guilds.cache.get(data.guildID) as TypicalGuild;
        if (!guild) return;

        if (!guild.me?.permissions.has('MANAGE_ROLES', true)) return;

        const member = await guild.members
            .fetch(data.memberID)
            .catch(() => null);
        if (!member) return;

        const settings = await guild.fetchSettings();

        if (
            !settings.roles.mute ||
            !member.roles.cache.has(settings.roles.mute)
        )
            return;

        const editable = guild.roles.cache.get(settings.roles.mute);
        if (!editable) return;

        const reason = guild.translate('moderation/unmute:TASK_REASON');

        const newCase = this.client.handlers.moderationLog
            .buildCase(guild)
            .setAction(MODERATION_LOG_TYPE.UNMUTE)
            .setModerator(this.client.user as ClientUser)
            .setUser(member.user)
            .setReason(reason);
        await newCase.send();

        await member.roles.remove(settings.roles.mute, reason);
    }
}
