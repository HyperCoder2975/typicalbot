const Command = require('../../structures/Command');

const Constants = require('../../utility/Constants');

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            description: 'Check if any members of the server have a server invite in their playing status.',
            usage: 'adcheck',
            permission: Constants.Permissions.Levels.SERVER_MODERATOR,
            mode: Constants.Modes.STRICT,
        });
    }

    execute(message) {
        const members = message.guild.members.filter((m) => m.user.presence.activity && /(discord\.(gg|io|me|li)\/.+|discordapp\.com\/invite\/.+)/i.test(m.user.presence.activity.name));

        const list = members.map((m) => `» ${m.displayName} (${m.id}) | ${m.user.presence.activity.name}`);

        message.send(list.length ? `There ${list.length === 1 ? 'is 1 user' : `are ${list.length} users`} with an invite in their status:\n\n${list.join('\n\n').substring(0, 2000)}` : 'There are no users with an invite in their status.');
    }

    embedExecute(message) {
        const members = message.guild.members.filter((m) => m.user.presence.activity && /(discord\.(gg|io|me|li)\/.+|discordapp\.com\/invite\/.+)/i.test(m.user.presence.activity.name));

        const list = members.map((m) => `» ${m.displayName} (${m.id}) | ${m.user.presence.activity.name}`);

        message.buildEmbed()
            .setColor(0xFF0000)
            .setTitle('Users with Invite in Playing Status')
            .setDescription(list.length ? list.join('\n\n').substring(0, 2000) : 'There are no users with an invite in their status.')
            .send();
    }
};
