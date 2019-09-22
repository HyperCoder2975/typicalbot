const Command = require('../../structures/Command');

const Constants = require('../../utility/Constants');

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            description: 'Softban a member from the server.',
            usage: 'softban <@user> [purge-days] [reason]',
            permission: Constants.Permissions.Levels.SERVER_MODERATOR,
            mode: Constants.Modes.STRICT,
        });
    }

    async execute(message, parameters, permissionLevel) {
        const args = /(?:<@!?)?(\d{17,20})>?(?:\s+(\d+))?(?:\s+(.+))?/i.exec(parameters);
        if (!args) return message.error(this.client.functions.error('usage', this));

        const user = args[1]; const days = args[2] || 2; const
            reason = args[3];

        this.client.users.fetch(user).then(async (cachedUser) => {
            const member = await message.guild.members.fetch(cachedUser);
            if (!member) return message.error('The requested user could not be found.');

            if (message.member.roles.highest.position <= member.roles.highest.position && (permissionLevel.level !== 4 && permissionLevel.level < 9)) return message.error('You cannot softban a user with either the same or higher highest role.');
            if (!member.bannable) return message.error('In order to complete the request, I need the **BAN_MEMBERS** permission and my highest role needs to be higher than the requested user\'s highest role.');

            this.client.caches.softbans.set(user.id || user, user.id || user);

            member.ban({ days, reason: `Softbanned by ${message.author.tag} | Reason: ${reason || 'No reason provided.'}` }).then((actioned) => {
                setTimeout(() => {
                    message.guild.members.unban(actioned.id, `Softbanned by ${message.author.tag} | Reason: ${reason || 'No reason provided.'}`).then(async () => {
                        if (message.guild.settings.logs.moderation) {
                            const newCase = this.client.handlers.moderationLog.buildCase(message.guild).setAction(Constants.ModerationLog.Types.SOFTBAN).setModerator(message.author).setUser(member.user);
                            if (reason) newCase.setReason(reason); newCase.send();

                            message.success(`Successfully softbanned user \`${actioned.user.tag}\`.`);
                        } else return message.success(`Successfully softbanned user **${member.user.tag}**.`);
                    });
                }, 1000);
            }).catch((err) => message.error('An error occured while trying to softban the requested user.'));
        }).catch((err) => message.error(`An error occured while trying to fetch the requested user.${message.author.id === '105408136285818880' ? `\n\n\`\`\`${err}\`\`\`` : ''}`));
    }
};
