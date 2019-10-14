import Task from '../structures/Task';
import Constants from '../utility/Constants';
import { UnmuteTaskData } from '../types/typicalbot';
import { TypicalGuild } from '../extensions/TypicalGuild';
import { ClientUser } from 'discord.js';

export default class extends Task {
    async execute(data: UnmuteTaskData) {
        const guild = this.client.guilds.get(data.guildID) as TypicalGuild;
        if (!guild) return;

        const member = await guild.members
            .fetch(data.memberID)
            .catch(() => null);
        if (!member) return;

        const settings = await guild.fetchSettings();

        if (!settings.roles.mute || !member.roles.has(settings.roles.mute))
            return;

        const editable = guild.roles.get(settings.roles.mute);
        if (!editable) return;

        const reason = guild.translate('moderation/unmute:TASK_REASON');

        const newCase = this.client.handlers.moderationLog
            .buildCase(guild)
            .setAction(Constants.ModerationLogTypes.UNMUTE)
            .setModerator(this.client.user as ClientUser)
            .setUser(member.user)
            .setReason(reason);
        newCase.send();

        member.roles.remove(settings.roles.mute, reason);
    }
}
