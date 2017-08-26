const Command = require("../../structures/Command");

module.exports = class extends Command {
    constructor(client, filePath) {
        super(client, filePath, {
            name: "ban",
            description: "Ban a member from the server.",
            usage: "ban <@user> [purge-days] [reason]",
            mode: "strict",
            permission: 2
        });
    }

    async execute(message, response, permissionLevel) {
        const args = /ban\s+(?:<@!?)?(\d{17,20})>?(?:\s+(\d+))?(?:\s+(.+))?/i.exec(message.content);
        if (!args) return response.usage(this);

        const user = args[1], purgeDays = args[2] || 0, reason = args[3];

        this.client.users.fetch(user).then(async cachedUser => {
            const member = await message.guild.fetchMember(cachedUser).catch(err => { return; });

            if (member && message.member.highestRole.position <= member.highestRole.position) return response.error(`You cannot ban a user with either the same or higher highest role.`);
            if (member && !member.bannable) return response.error(`In order to complete the request, I need the **BAN_MEMBERS** permission.`);

            const toBan = cachedUser || user;

            const log = { "moderator": message.author };
            if (reason) Object.assign(log, { reason });

            this.client.banCache.set(toBan.id || toBan, log);

            message.guild.ban(toBan, { days: purgeDays }).then(actioned => {
                response.success(`Successfully banned user \`${actioned.tag || actioned}\`.`);
            }).catch(err => {
                if (err === "Error: Couldn't resolve the user ID to ban.") return response.error(`The requested user could not be found.`);

                response.error(`An error occured while trying to ban the requested user.${message.author.id === "105408136285818880" ? `\n\n\`\`\`${err}\`\`\`` : ""}`);

                this.client.banCache.delete(toBan.id || toBan);
            });
        }).catch(err => response.error(`An error occured while trying to fetch the requested user.${message.author.id === "105408136285818880" ? `\n\n\`\`\`${err}\`\`\`` : ""}`));
    }
};
