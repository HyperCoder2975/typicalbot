const Task = require("../structures/Task");
const Constants = require(`../utility/Constants`);

module.exports = class extends Task {
    constructor(...args) {
        super(...args);
    }

    async execute() {
        const guild = this.client.guilds.get(this.guild); if (!guild) return;
        const member = await guild.members.fetch(this.member).catch(err => this.delete(this.id)); if (!member) return;

        const settings = await guild.fetchSettings();

        if (!settings.roles.mute || !member.roles.has(settings.roles.mute) || !guild.roles.get(settings.roles.mute).editable) return this.timers.delete(this.id);

        const newCase = this.client.handlers.moderationLog.buildCase(guild).setAction(Constants.ModerationLog.Types.UNMUTE).setModerator(this.client.user).setUser(member.user).setReason("Automatic Unmute: User's mute time has passed.");
        newCase.send();

        member.removeRole(settings.roles.mute, "Automatic Unmute: User's mute time has passed.");
        return this.timers.delete(this.id);
    }
};