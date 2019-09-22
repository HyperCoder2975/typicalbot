const Command = require('../../structures/Command');

const Constants = require('../../utility/Constants');

const settingsList = {
    embed: 'Embed responses from TypicalBot.',
    adminrole: 'Administrator role that will grant users with this role permission level 3.',
    modrole: 'Moderator role that will grant users with this role permission level 2.',
    djrole: 'DJ role that will grant users with this role permission level 1.',
    muterole: 'A role the bot will give users when muted.',
    blacklistrole: "Users with this role will be denied access to any of TypicalBot's commands.",
    autorole: 'Users joining the server will automatically be given this role.',
    'autorole-bots': 'Bots joining the server will automatically be given this role.',
    'autorole-delay': 'The amount of time to wait before giving the autorole to allow for security levels to work.',
    'autorole-silent': 'If not silent, a message will be sent in the logs channel stating a member was given the autorole.',
    subscriberrole: 'A role that will be given when a user uses the `subscribe` command.',
    announcements: 'A channel for announcements to be posted, used with the `announce` command.',
    'announcements-mention': 'A mention to be put in the announcement when posted, such as a Subscriber role.',
    logs: 'A channel for activity logs to be posted.',
    'logs-join': 'A custom set message to be posted when a user joins the server.',
    'logs-leave': 'A custom set message to be posted when a user leaves the server.',
    'logs-ban': 'A custom set message to be posted when a user is banned from the server.',
    'logs-unban': 'A custom set message to be posted when a user is unbanned from the server.',
    'logs-nickname': 'A custom set message to be posted when a user changes their nickname in the server.',
    'logs-invite': 'A custom set message to be posted when a user posts an invite in the server.',
    'logs-say': 'Whether to log uses of the \`$say\` command.',
    modlogs: 'A channel to send moderation logs in. Aka audit logs.',
    'modlogs-purge': 'A modlog to log when a moderator or administrator purges messages in a channel.',
    automessage: 'A message to be sent to a user when they join the server.',
    autonickname: 'A nickname to give a user when they join the server.',
    mode: 'A mode to enable certain commands.',
    customprefix: 'A custom prefix to user other than `$`.',
    defaultprefix: 'The default prefix `$`.',
    antiinvite: 'Server moderation tool to delete any invites sent by users in the server.',
    'antiinvite-action': 'Enable warning and kicking when sending invites. AntiInvite must be enabled for this to work.',
    'antiinvite-warn': 'A user will receive a warning if they send this exact number of invites. AntiInvite and AntiInvite Action must be enabled for this to work.',
    'antiinvite-kick': 'A user will be kicked if they send this number or more invites. AntiInvite and AntiInvite Action must be enabled for this to work.',
    nonickname: 'A way to disable the `nickname` command from being used.',
    'music-permissions': 'Change the required permission level for users to use all music commands.',
    'music-play': 'Change the required permission level for users to use the `play` music command. Unless set to `off`, this overwrites the `music-permissions` setting.',
    'music-skip': 'Change the required permission level for users to use the `skip` music command. Unless set to `off`, this overwrites the `music-permissions` setting.',
    'music-stop': 'Change the required permission level for users to use the `stop` music command. Unless set to `off`, this overwrites the `music-permissions` setting.',
    'music-pause': 'Change the required permission level for users to use the `pause` music command. Unless set to `off`, this overwrites the `music-permissions` setting.',
    'music-resume': 'Change the required permission level for users to use the `resume` music command. Unless set to `off`, this overwrites the `music-permissions` setting.',
    'music-unqueue': 'Change the required permission level for users to use the `unqueue` music command. Unless set to `off`, this overwrites the `music-permissions` setting.',
    'music-volume': 'Change the required permission level for users to use the `volume` music command. Unless set to `off`, this overwrites the `music-permissions` setting.',
    'music-timelimit': 'Change the maximum time limit for a video. Set in seconds. Minimum is 120 seconds (2 minutes). Maximum is 600 seconds (10 minutes). TypicalBot Prime Member maximum is 7200 seconds (2 hours).',
    'music-queuelimit': 'Change the maximum queue limit for a video. Maximum is 10 videos. TypicalBot Prime Member maximum is 100 videos.',
    starboard: 'A channel to send starred messages in, i.e. a starboard.',
    'starboard-stars': 'Change the required stars count for messages to appear in the starboard.',
};

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            description: 'View or customize your servers setting and enable/disable specific features.',
            usage: "settings <'list'|'clear'|'view'|'edit'> [setting] ['add'|'remove'] [value]",
            aliases: ['set'],
            mode: Constants.Modes.STRICT,
        });
    }

    async execute(message, parameters) {
        const args = /(list|view|edit)(?:\s+([\w-]+)\s*(?:(add|remove)\s+)?((?:.|[\r\n])+)?)?/i.exec(parameters);
        if (!args) return message.error(this.client.functions.error('usage', this));

        const actualUserPermissions = await this.client.handlers.permissions.fetch(message.guild, message.author, true);

        const accessLevel = await this.client.functions.fetchAccess(message.guild);

        const action = args[1]; const setting = args[2]; const ar = args[3]; const
            value = args[4];

        if ((action === 'edit' || action === 'clear') && actualUserPermissions.level < 3) return message.error(this.client.functions.error('perms', { permission: 3 }, actualUserPermissions));

        if (action === 'list') {
            let page = setting || 1;
            const settings = Object.keys(settingsList);
            const count = Math.ceil(settings.length / 10);
            if (page < 1 || page > count) page = 1;

            const list = settings.splice((page - 1) * 10, 10).map((k) => ` • **${k}:** ${settingsList[k]}`);

            message.send(`**__Available settings to use with TypicalBot:__**\n\n**Page ${page} / ${count}**\n${list.join('\n')}`);
        } else if (action === 'clear') {
            this.client.settings.delete(message.guild.id).then(() => {
                message.reply('Settings cleared.');
            }).catch((err) => {
                message.error('Something happened. Try again.');
            });
        } else if (action === 'view') {
            if (setting) {
                if (setting === 'embed') {
                    message.reply(`**__Current Value:__** ${message.guild.settings.embed ? 'Enabled' : 'Disabled'}`);
                } else if (setting === 'adminrole') {
                    const rawList = message.guild.settings.roles.administrator;
                    const list = rawList.filter((r) => message.guild.roles.has(r)).map((r) => `*${message.guild.id === r ? message.guild.roles.get(r).name.slice(1) : message.guild.roles.get(r).name}*`);

                    if (!list.length) return message.reply('**__Current Value:__** None');
                    message.reply(`**__Current Value:__** ${list.join(', ')}`);
                } else if (setting === 'modrole') {
                    const rawList = message.guild.settings.roles.moderator;
                    const list = rawList.filter((r) => message.guild.roles.has(r)).map((r) => `*${message.guild.id === r ? message.guild.roles.get(r).name.slice(1) : message.guild.roles.get(r).name}*`);

                    if (!list.length) return message.reply('**__Current Value:__** None');
                    message.reply(`**__Current Value:__** ${list.join(', ')}`);
                } else if (setting === 'djrole') {
                    const rawList = message.guild.settings.roles.dj;
                    const list = rawList.filter((r) => message.guild.roles.has(r)).map((r) => `*${message.guild.id === r ? message.guild.roles.get(r).name.slice(1) : message.guild.roles.get(r).name}*`);

                    if (!list.length) return message.reply('**__Current Value:__** None');
                    message.reply(`**__Current Value:__** ${list.join(', ')}`);
                } else if (setting === 'muterole') {
                    const role = message.guild.roles.get(message.guild.settings.roles.mute);

                    if (!role) return message.reply('**__Current Value:__** None');
                    message.reply(`**__Current Value:__** ${role.name}`);
                } else if (setting === 'blacklistrole') {
                    const rawList = message.guild.settings.roles.blacklist;
                    const list = rawList.filter((r) => message.guild.roles.has(r)).map((r) => `*${message.guild.id === r ? message.guild.roles.get(r).name.slice(1) : message.guild.roles.get(r).name}*`);

                    if (!list.length) return message.reply('**__Current Value:__** None');
                    message.reply(`**__Current Value:__** ${list.join(', ')}`);
                } else if (setting === 'subscriberrole') {
                    const role = message.guild.roles.get(message.guild.settings.subscriber);

                    if (!role) return message.reply('**__Current Value:__** None');
                    message.reply(`**__Current Value:__** ${role.name}`);
                } else if (setting === 'autorole') {
                    const role = message.guild.roles.get(message.guild.settings.auto.role.id);

                    if (!role) return message.reply('**__Current Value:__** None');
                    message.reply(`**__Current Value:__** ${role.name}`);
                } else if (setting === 'autorole-bots') {
                    const role = message.guild.roles.get(message.guild.settings.auto.role.bots);

                    if (!role) return message.reply('**__Current Value:__** None');
                    message.reply(`**__Current Value:__** ${role.name}`);
                } else if (setting === 'autorole-delay') {
                    message.reply(`**__Current Value:__** ${message.guild.settings.auto.role.delay ? `${message.guild.settings.auto.role.delay}ms` : 'Default'}`);
                } else if (setting === 'autorole-silent') {
                    message.reply(`**__Current Value:__** ${message.guild.settings.auto.role.silent ? 'Enabled' : 'Disabled'}`);
                } else if (setting === 'announcements') {
                    const channel = message.guild.channels.get(message.guild.settings.announcements.id);

                    if (!channel) return message.reply('**__Current Value:__** None');
                    message.reply(`**__Current Value:__** ${channel.toString()}`);
                } else if (setting === 'announcements-mention' || setting === 'ann-mention') {
                    const role = message.guild.roles.get(message.guild.settings.announcements.mention);

                    if (!role) return message.reply('**__Current Value:__** None');
                    message.reply(`**__Current Value:__** ${role.name}`);
                } else if (setting === 'logs') {
                    const channel = message.guild.channels.get(message.guild.settings.logs.id);

                    if (!channel) return message.reply('**__Current Value:__** None');
                    message.reply(`**__Current Value:__** ${channel.toString()}`);
                } else if (setting === 'logs-join') {
                    const log = message.guild.settings.logs.join;
                    const disabled = log === '--disabled';
                    const embed = log === '--embed';
                    const logText = !log ? 'Default' : disabled ? 'Disabled' : embed ? 'Embed' : `\`\`\`txt\n${log}\n\`\`\``;

                    message.reply(`**__Current Value:__** ${logText}`);
                } else if (setting === 'logs-leave') {
                    const log = message.guild.settings.logs.leave;
                    const disabled = log === '--disabled';
                    const embed = log === '--embed';
                    const logText = !log ? 'Default' : disabled ? 'Disabled' : embed ? 'Embed' : `\`\`\`txt\n${log}\n\`\`\``;

                    message.reply(`**__Current Value:__** ${logText}`);
                } else if (setting === 'logs-ban') {
                    const log = message.guild.settings.logs.ban;
                    const disabled = log === '--disabled';
                    const embed = log === '--embed';
                    const logText = !log ? 'Default' : disabled ? 'Disabled' : embed ? 'Embed' : `\`\`\`txt\n${log}\n\`\`\``;

                    message.reply(`**__Current Value:__** ${logText}`);
                } else if (setting === 'logs-unban') {
                    const log = message.guild.settings.logs.unban;
                    const disabled = log === '--disabled';
                    const embed = log === '--embed';
                    const logText = !log ? 'Default' : disabled ? 'Disabled' : embed ? 'Embed' : `\`\`\`txt\n${log}\n\`\`\``;

                    message.reply(`**__Current Value:__** ${logText}`);
                } else if (setting === 'logs-nickname') {
                    const log = message.guild.settings.logs.nickname;
                    const enabled = log === '--enabled';
                    const logText = enabled ? 'Default' : !log ? 'Disabled' : `\`\`\`txt\n${log}\n\`\`\``;

                    message.reply(`**__Current Value:__** ${logText}`);
                } else if (setting === 'logs-invite') {
                    const log = message.guild.settings.logs.invite;
                    const enabled = log === '--enabled';
                    const logText = enabled ? 'Default' : !log ? 'Disabled' : `\`\`\`txt\n${log}\n\`\`\``;

                    message.reply(`**__Current Value:__** ${logText}`);
                } else if (setting === 'logs-say') {
                    const log = message.guild.settings.logs.say;
                    const enabled = log === '--enabled';
                    const logText = enabled ? 'Default' : !log ? 'Disabled' : `\`\`\`txt\n${log}\n\`\`\``;

                    message.reply(`**__Current Value:__** ${logText}`);
                } else if (setting === 'modlogs' || setting === 'logs-moderation') {
                    const channel = message.guild.channels.get(message.guild.settings.logs.moderation);

                    if (!channel) return message.reply('**__Current Value:__** None');
                    message.reply(`**__Current Value:__** ${channel.toString()}`);
                } else if (setting === 'modlogs-purge') {
                    message.reply(`**__Current Value:__** ${message.guild.settings.prefix.default ? 'Enabled' : 'Disabled'}`);
                } else if (setting === 'automessage') {
                    message.reply(`**__Current Value:__** ${message.guild.settings.auto.message ? `\`\`\`txt\n${message.guild.settings.auto.message}\n\`\`\`` : 'None'}`);
                } else if (setting === 'autonickname') {
                    message.reply(`**__Current Value:__** ${message.guild.settings.auto.nickname ? `\`\`\`txt\n${message.guild.settings.auto.nickname}\n\`\`\`` : 'None'}`);
                } else if (setting === 'mode') {
                    message.reply(`**__Current Value:__** ${message.guild.settings.mode}`);
                } else if (setting === 'customprefix') {
                    message.reply(`**__Current Value:__** ${message.guild.settings.prefix.custom ? message.guild.settings.prefix.custom : 'None'}`);
                } else if (setting === 'defaultprefix') {
                    message.reply(`**__Current Value:__** ${message.guild.settings.prefix.default ? 'Enabled' : 'Disabled'}`);
                } else if (setting === 'antiinvite') {
                    message.reply(`**__Current Value:__** ${message.guild.settings.automod.invite ? 'Enabled' : 'Disabled'}`);
                } else if (setting === 'antiinvite-action') {
                    message.reply(`**__Current Value:__** ${message.guild.settings.automod.inviteaction ? 'Enabled' : 'Disabled'}`);
                } else if (setting === 'antiinvite-warn') {
                    message.reply(`**__Current Value:__** ${message.guild.settings.automod.invitewarn || 'Disabled'}`);
                } else if (setting === 'antiinvite-kick') {
                    message.reply(`**__Current Value:__** ${message.guild.settings.automod.invitekick || 'Disabled'}`);
                } else if (setting === 'nonickname') {
                    message.reply(`**__Current Value:__** ${message.guild.settings.nonickname ? 'Enabled' : 'Disabled'}`);
                } else if (setting === 'music-permissions') {
                    message.reply(`**__Current Value:__** ${message.guild.settings.music.default}`);
                } else if (setting === 'music-play') {
                    message.reply(`**__Current Value:__** ${message.guild.settings.music.play}`);
                } else if (setting === 'music-skip') {
                    message.reply(`**__Current Value:__** ${message.guild.settings.music.skip}`);
                } else if (setting === 'music-stop') {
                    message.reply(`**__Current Value:__** ${message.guild.settings.music.stop}`);
                } else if (setting === 'music-pause') {
                    message.reply(`**__Current Value:__** ${message.guild.settings.music.pause}`);
                } else if (setting === 'music-resume') {
                    message.reply(`**__Current Value:__** ${message.guild.settings.music.resume}`);
                } else if (setting === 'music-unqueue') {
                    message.reply(`**__Current Value:__** ${message.guild.settings.music.unqueue}`);
                } else if (setting === 'music-volume') {
                    message.reply(`**__Current Value:__** ${message.guild.settings.music.volume}`);
                } else if (setting === 'music-timelimit') {
                    message.reply(`**__Current Value:__** ${message.guild.settings.music.timelimit || 'Default'}`);
                } else if (setting === 'music-queuelimit') {
                    message.reply(`**__Current Value:__** ${message.guild.settings.music.queuelimit || 'Default'}`);
                } else if (setting === 'starboard') {
                    const channel = message.guild.channels.get(message.guild.settings.starboard.id);

                    if (!channel) return message.reply('**__Current Value:__** None');
                    message.reply(`**__Current Value:__** ${channel.toString()}`);
                } else if (setting === 'starboard-stars') {
                    message.reply(`**__Current Value:__** ${message.guild.settings.starboard.count}`);
                } else {
                    message.error("The requested setting doesn't exist");
                }
            } else {
                message.send('**__Currently Set Settings:__**\n\n');
            }
        } else if (action === 'edit') {
            if (setting && value) {
                if (setting === 'embed') {
                    if (value === 'disable') {
                        this.client.settings.update(message.guild.id, { embed: false }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'enable') {
                        this.client.settings.update(message.guild.id, { embed: true }).then(() => message.success('Setting successfully updated.'));
                    } else {
                        message.error('An invalid option was given.');
                    }
                } else if (setting === 'adminrole') {
                    if (value === 'disable' || value === 'clear') {
                        this.client.settings.update(message.guild.id, { roles: { administrator: [] } }).then(() => message.success('Setting successfully updated.'));
                    } else if (ar) {
                        if (ar === 'add') {
                            const subArgs = /(?:(?:<@&)?(\d{17,20})>?|(.+))/i.exec(value);

                            const role = subArgs[1] ? message.guild.roles.get(subArgs[1]) : message.guild.roles.find((r) => r.name.toLowerCase() === subArgs[2].toLowerCase());
                            if (!role) return message.error('Invalid role. Please make sure your spelling is correct, and that the role actually exists.');

                            const currentList = message.guild.settings.roles.administrator;
                            if (currentList.includes(role.id)) return message.error('The specified role is already included in the list of roles for the administrator permission level.');

                            currentList.push(role.id);

                            this.client.settings.update(message.guild.id, { roles: { administrator: currentList } }).then(() => message.success('Setting successfully updated.'));
                        } else if (ar === 'remove') {
                            const subArgs = /(?:(?:<@&)?(\d{17,20})>?|(.+))/i.exec(value);

                            const role = subArgs[1] ? message.guild.roles.get(subArgs[1]) : message.guild.roles.find((r) => r.name.toLowerCase() === subArgs[2].toLowerCase());
                            if (!role) return message.error('Invalid role. Please make sure your spelling is correct, and that the role actually exists.');

                            const currentList = message.guild.settings.roles.administrator;
                            if (!currentList.includes(role.id)) return message.error('The specified role is not included in of list of roles for the administrator permission level.');

                            currentList.splice(currentList.indexOf(role.id));

                            this.client.settings.update(message.guild.id, { roles: { administrator: currentList } }).then(() => message.success('Setting successfully updated.'));
                        }
                    } else {
                        const subArgs = /(?:(?:<@&)?(\d{17,20})>?|(.+))/i.exec(value);

                        const role = subArgs[1] ? message.guild.roles.get(subArgs[1]) : message.guild.roles.find((r) => r.name.toLowerCase() === subArgs[2].toLowerCase());
                        if (!role) return message.error('Invalid role. Please make sure your spelling is correct, and that the role actually exists.');

                        this.client.settings.update(message.guild.id, { roles: { administrator: [role.id] } }).then(() => message.success('Setting successfully updated.'));
                    }
                } else if (setting === 'modrole') {
                    if (value === 'disable' || value === 'clear') {
                        this.client.settings.update(message.guild.id, { roles: { moderator: [] } }).then(() => message.success('Setting successfully updated.'));
                    } else if (ar) {
                        if (ar === 'add') {
                            const subArgs = /(?:(?:<@&)?(\d{17,20})>?|(.+))/i.exec(value);

                            const role = subArgs[1] ? message.guild.roles.get(subArgs[1]) : message.guild.roles.find((r) => r.name.toLowerCase() === subArgs[2].toLowerCase());
                            if (!role) return message.error('Invalid role. Please make sure your spelling is correct, and that the role actually exists.');

                            const currentList = message.guild.settings.roles.moderator;
                            if (currentList.includes(role.id)) return message.error('The specified role is already included in the list of roles for the administrator permission level.');

                            currentList.push(role.id);

                            this.client.settings.update(message.guild.id, {
                                roles: { moderator: currentList },
                            }).then(() => message.success('Setting successfully updated.'));
                        } else if (ar === 'remove') {
                            const subArgs = /(?:(?:<@&)?(\d{17,20})>?|(.+))/i.exec(value);

                            const role = subArgs[1] ? message.guild.roles.get(subArgs[1]) : message.guild.roles.find((r) => r.name.toLowerCase() === subArgs[2].toLowerCase());
                            if (!role) return message.error('Invalid role. Please make sure your spelling is correct, and that the role actually exists.');

                            const currentList = message.guild.settings.roles.moderator;
                            if (!currentList.includes(role.id)) return message.error('The specified role is not included in of list of roles for the administrator permission level.');

                            currentList.splice(currentList.indexOf(role.id));

                            this.client.settings.update(message.guild.id, { roles: { moderator: currentList } }).then(() => message.success('Setting successfully updated.'));
                        }
                    } else {
                        const subArgs = /(?:(?:<@&)?(\d{17,20})>?|(.+))/i.exec(value);

                        const role = subArgs[1] ? message.guild.roles.get(subArgs[1]) : message.guild.roles.find((r) => r.name.toLowerCase() === subArgs[2].toLowerCase());
                        if (!role) return message.error('Invalid role. Please make sure your spelling is correct, and that the role actually exists.');

                        this.client.settings.update(message.guild.id, { roles: { moderator: [role.id] } }).then(() => message.success('Setting successfully updated.'));
                    }
                } else if (setting === 'djrole') {
                    if (value === 'disable' || value === 'clear') {
                        this.client.settings.update(message.guild.id, { roles: { dj: [] } }).then(() => message.success('Setting successfully updated.'));
                    } else if (ar) {
                        if (ar === 'add') {
                            const subArgs = /(?:(?:<@&)?(\d{17,20})>?|(.+))/i.exec(value);

                            const role = subArgs[1] ? message.guild.roles.get(subArgs[1]) : message.guild.roles.find((r) => r.name.toLowerCase() === subArgs[2].toLowerCase());
                            if (!role) return message.error('Invalid role. Please make sure your spelling is correct, and that the role actually exists.');

                            const currentList = message.guild.settings.roles.dj;
                            if (currentList.includes(role.id)) return message.error('The specified role is already included in the list of roles for the administrator permission level.');

                            currentList.push(role.id);

                            this.client.settings.update(message.guild.id, { roles: { dj: currentList } }).then(() => message.success('Setting successfully updated.'));
                        } else if (ar === 'remove') {
                            const subArgs = /(?:(?:<@&)?(\d{17,20})>?|(.+))/i.exec(value);

                            const role = subArgs[1] ? message.guild.roles.get(subArgs[1]) : message.guild.roles.find((r) => r.name.toLowerCase() === subArgs[2].toLowerCase());
                            if (!role) return message.error('Invalid role. Please make sure your spelling is correct, and that the role actually exists.');

                            const currentList = message.guild.settings.roles.dj;
                            if (!currentList.includes(role.id)) return message.error('The specified role is not included in of list of roles for the administrator permission level.');

                            currentList.splice(currentList.indexOf(role.id));

                            this.client.settings.update(message.guild.id, { roles: { dj: currentList } }).then(() => message.success('Setting successfully updated.'));
                        }
                    } else {
                        const subArgs = /(?:(?:<@&)?(\d{17,20})>?|(.+))/i.exec(value);

                        const role = subArgs[1] ? message.guild.roles.get(subArgs[1]) : message.guild.roles.find((r) => r.name.toLowerCase() === subArgs[2].toLowerCase());
                        if (!role) return message.error('Invalid role. Please make sure your spelling is correct, and that the role actually exists.');

                        this.client.settings.update(message.guild.id, { roles: { dj: [role.id] } }).then(() => message.success('Setting successfully updated.'));
                    }
                } else if (setting === 'muterole') {
                    if (value === 'disable') {
                        this.client.settings.update(message.guild.id, { roles: { mute: null } }).then(() => message.success('Setting successfully updated.'));
                    } else {
                        const subArgs = /(?:(?:<@&)?(\d{17,20})>?|(.+))/i.exec(value);

                        const role = subArgs[1] ? message.guild.roles.get(subArgs[1]) : message.guild.roles.find((r) => r.name.toLowerCase() === subArgs[2].toLowerCase());
                        if (!role) return message.error('Invalid role. Please make sure your spelling is correct, and that the role actually exists.');

                        this.client.settings.update(message.guild.id, { roles: { mute: role.id } }).then(() => message.success('Setting successfully updated.'));
                    }
                } else if (setting === 'blacklistrole') {
                    if (value === 'disable' || value === 'clear') {
                        this.client.settings.update(message.guild.id, { roles: { blacklist: [] } }).then(() => message.success('Setting successfully updated.'));
                    } else if (ar) {
                        if (ar === 'add') {
                            const subArgs = /(?:(?:<@&)?(\d{17,20})>?|(.+))/i.exec(value);

                            const role = subArgs[1] ? message.guild.roles.get(subArgs[1]) : message.guild.roles.find((r) => r.name.toLowerCase() === subArgs[2].toLowerCase());
                            if (!role) return message.error('Invalid role. Please make sure your spelling is correct, and that the role actually exists.');

                            const currentList = message.guild.settings.roles.blacklist;
                            if (currentList.includes(role.id)) return message.error('The specified role is already included in the list of roles for the administrator permission level.');

                            currentList.push(role.id);

                            this.client.settings.update(message.guild.id, { roles: { blacklist: currentList } }).then(() => message.success('Setting successfully updated.'));
                        } else if (ar === 'remove') {
                            const subArgs = /(?:(?:<@&)?(\d{17,20})>?|(.+))/i.exec(value);

                            const role = subArgs[1] ? message.guild.roles.get(subArgs[1]) : message.guild.roles.find((r) => r.name.toLowerCase() === subArgs[2].toLowerCase());
                            if (!role) return message.error('Invalid role. Please make sure your spelling is correct, and that the role actually exists.');

                            const currentList = message.guild.settings.roles.blacklist;
                            if (!currentList.includes(role.id)) return message.error('The specified role is not included in of list of roles for the administrator permission level.');

                            currentList.splice(currentList.indexOf(role.id));

                            this.client.settings.update(message.guild.id, { roles: { blacklist: currentList } }).then(() => message.success('Setting successfully updated.'));
                        }
                    } else {
                        const subArgs = /(?:(?:<@&)?(\d{17,20})>?|(.+))/i.exec(value);

                        const role = subArgs[1] ? message.guild.roles.get(subArgs[1]) : message.guild.roles.find((r) => r.name.toLowerCase() === subArgs[2].toLowerCase());
                        if (!role) return message.error('Invalid role. Please make sure your spelling is correct, and that the role actually exists.');

                        this.client.settings.update(message.guild.id, { roles: { blacklist: [role.id] } }).then(() => message.success('Setting successfully updated.'));
                    }
                } else if (setting === 'autorole') {
                    if (value === 'disable') {
                        this.client.settings.update(message.guild.id, { auto: { role: { id: null } } }).then(() => message.success('Setting successfully updated.'));
                    } else {
                        const subArgs = /(?:(?:<@&)?(\d{17,20})>?|(.+))/i.exec(value);

                        const role = subArgs[1] ? message.guild.roles.get(subArgs[1]) : message.guild.roles.find((r) => r.name.toLowerCase() === subArgs[2].toLowerCase());
                        if (!role) return message.error('Invalid role. Please make sure your spelling is correct, and that the role actually exists.');

                        this.client.settings.update(message.guild.id, { auto: { role: { id: role.id } } }).then(() => message.success('Setting successfully updated.'));
                    }
                } else if (setting === 'autorole-bots') {
                    if (value === 'disable') {
                        this.client.settings.update(message.guild.id, { auto: { role: { bots: null } } }).then(() => message.success('Setting successfully updated.'));
                    } else {
                        const subArgs = /(?:(?:<@&)?(\d{17,20})>?|(.+))/i.exec(value);

                        const role = subArgs[1] ? message.guild.roles.get(subArgs[1]) : message.guild.roles.find((r) => r.name.toLowerCase() === subArgs[2].toLowerCase());
                        if (!role) return message.error('Invalid role. Please make sure your spelling is correct, and that the role actually exists.');

                        this.client.settings.update(message.guild.id, { auto: { role: { bots: role.id } } }).then(() => message.success('Setting successfully updated.'));
                    }
                } else if (setting === 'autorole-delay') {
                    if (value === 'disable' || value === 'default') {
                        this.client.settings.update(message.guild.id, { auto: { role: { delay: null } } }).then(() => message.success('Setting successfully updated.'));
                    } else {
                        const subArgs = /^(\d+)$/i.exec(value);
                        if (!subArgs || subArgs[1] > 600000 || subArgs[1] < 2000) return message.error('An invalid time was given. Try again with a time, in milliseconds, from 2000ms (2s) to 600000ms (10 min).');

                        this.client.settings.update(message.guild.id, { auto: { role: { delay: subArgs[1] } } }).then(() => message.success('Setting successfully updated.'));
                    }
                } else if (setting === 'autorole-silent') {
                    if (value === 'disable') {
                        this.client.settings.update(message.guild.id, { auto: { role: { silent: false } } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'enable') {
                        this.client.settings.update(message.guild.id, { auto: { role: { silent: true } } }).then(() => message.success('Setting successfully updated.'));
                    } else {
                        message.error('An invalid option was given.');
                    }
                } else if (setting === 'subscriberrole') {
                    if (value === 'disable') {
                        this.client.settings.update(message.guild.id, { subscriber: null }).then(() => message.success('Setting successfully updated.'));
                    } else {
                        const subArgs = /(?:(?:<@&)?(\d{17,20})>?|(.+))/i.exec(value);

                        const role = subArgs[1] ? message.guild.roles.get(subArgs[1]) : message.guild.roles.find((r) => r.name.toLowerCase() === subArgs[2].toLowerCase());
                        if (!role) return message.error('Invalid role. Please make sure your spelling is correct, and that the role actually exists.');

                        this.client.settings.update(message.guild.id, { subscriber: role.id }).then(() => message.success('Setting successfully updated.'));
                    }
                } else if (setting === 'announcements') {
                    if (value === 'disable') {
                        this.client.settings.update(message.guild.id, { announcements: { id: null } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'here') {
                        this.client.settings.update(message.guild.id, { announcements: { id: message.channel.id } }).then(() => message.success('Setting successfully updated.'));
                    } else {
                        const subArgs = /(?:(?:<#)?(\d{17,20})>?|(.+))/i.exec(value);

                        const channel = subArgs[1] ? message.guild.channels.get(subArgs[1]) : message.guild.channels.find((c) => c.name.toLowerCase() === subArgs[2].toLowerCase());
                        if (!channel) return message.error('Invalid channel. Please make sure your spelling is correct, and that the channel actually exists.');
                        if (channel.type !== 'text') return message.error('The channel must be a text channel.');

                        this.client.settings.update(message.guild.id, { announcements: { id: channel.id } }).then(() => message.success('Setting successfully updated.'));
                    }
                } else if (setting === 'announcements-mention' || setting === 'ann-mention') {
                    if (value === 'disable') {
                        this.client.settings.update(message.guild.id, { announcements: { mention: null } }).then(() => message.success('Setting successfully updated.'));
                    } else {
                        const subArgs = /(?:(?:<@&)?(\d{17,20})>?|(.+))/i.exec(value);

                        const role = subArgs[1] ? message.guild.roles.get(subArgs[1]) : message.guild.roles.find((r) => r.name.toLowerCase() === subArgs[2].toLowerCase());
                        if (!role) return message.error('Invalid role. Please make sure your spelling is correct, and that the role actually exists.');

                        this.client.settings.update(message.guild.id, { announcements: { mention: role.id } }).then(() => message.success('Setting successfully updated.'));
                    }
                } else if (setting === 'logs') {
                    if (value === 'disable') {
                        this.client.settings.update(message.guild.id, { logs: { id: null } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'here') {
                        this.client.settings.update(message.guild.id, { logs: { id: message.channel.id } }).then(() => message.success('Setting successfully updated.'));
                    } else {
                        const subArgs = /(?:(?:<#)?(\d{17,20})>?|(.+))/i.exec(value);

                        const channel = subArgs[1] ? message.guild.channels.get(subArgs[1]) : message.guild.channels.find((c) => c.name.toLowerCase() === subArgs[2].toLowerCase());
                        if (!channel) return message.error('Invalid channel. Please make sure your spelling is correct, and that the channel actually exists.');
                        if (channel.type !== 'text') return message.error('The channel must be a text channel.');

                        this.client.settings.update(message.guild.id, { logs: { id: channel.id } }).then(() => message.success('Setting successfully updated.'));
                    }
                } else if (setting === 'logs-join') {
                    if (!message.guild.settings.logs.id) return message.error('You must have a logs channel set up before changing this setting.');
                    if (value === 'disable') {
                        this.client.settings.update(message.guild.id, { logs: { join: '--disabled' } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'default' || value === 'enable') {
                        this.client.settings.update(message.guild.id, { logs: { join: null } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'embed') {
                        this.client.settings.update(message.guild.id, { logs: { join: '--embed' } }).then(() => message.success('Setting successfully updated.'));
                    } else {
                        this.client.settings.update(message.guild.id, { logs: { join: value } }).then(() => message.success('Setting successfully updated.'));
                    }
                } else if (setting === 'logs-leave') {
                    if (!message.guild.settings.logs.id) return message.error('You must have a logs channel set up before changing this setting.');

                    if (value === 'disable') {
                        this.client.settings.update(message.guild.id, { logs: { leave: '--disabled' } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'default' || value === 'enable') {
                        this.client.settings.update(message.guild.id, { logs: { leave: null } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'embed') {
                        this.client.settings.update(message.guild.id, { logs: { leave: '--embed' } }).then(() => message.success('Setting successfully updated.'));
                    } else {
                        this.client.settings.update(message.guild.id, { logs: { leave: value } }).then(() => message.success('Setting successfully updated.'));
                    }
                } else if (setting === 'logs-ban') {
                    if (!message.guild.settings.logs.id) return message.error('You must have a logs channel set up before changing this setting.');

                    if (value === 'disable') {
                        this.client.settings.update(message.guild.id, { logs: { ban: '--disabled' } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'default' || value === 'enable') {
                        this.client.settings.update(message.guild.id, { logs: { ban: null } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'embed') {
                        this.client.settings.update(message.guild.id, { logs: { ban: '--embed' } }).then(() => message.success('Setting successfully updated.'));
                    } else {
                        this.client.settings.update(message.guild.id, { logs: { ban: value } }).then(() => message.success('Setting successfully updated.'));
                    }
                } else if (setting === 'logs-unban') {
                    if (!message.guild.settings.logs.id) return message.error('You must have a logs channel set up before changing this setting.');

                    if (value === 'disable') {
                        this.client.settings.update(message.guild.id, { logs: { unban: '--disabled' } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'default' || value === 'enable') {
                        this.client.settings.update(message.guild.id, { logs: { unban: null } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'embed') {
                        this.client.settings.update(message.guild.id, { logs: { unban: '--embed' } }).then(() => message.success('Setting successfully updated.'));
                    } else {
                        this.client.settings.update(message.guild.id, { logs: { unban: value } }).then(() => message.success('Setting successfully updated.'));
                    }
                } else if (setting === 'logs-nickname') {
                    if (!message.guild.settings.logs.id) return message.error('You must have a logs channel set up before changing this setting.');

                    if (value === 'disable') {
                        this.client.settings.update(message.guild.id, { logs: { nickname: null } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'default' || value === 'enable') {
                        this.client.settings.update(message.guild.id, { logs: { nickname: '--enabled' } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'embed') {
                        this.client.settings.update(message.guild.id, { logs: { nickname: '--embed' } }).then(() => message.success('Setting successfully updated.'));
                    } else {
                        this.client.settings.update(message.guild.id, { logs: { nickname: value } }).then(() => message.success('Setting successfully updated.'));
                    }
                } else if (setting === 'logs-invite') {
                    if (!message.guild.settings.logs.id) return message.error('You must have a logs channel set up before changing this setting.');

                    if (value === 'disable') {
                        this.client.settings.update(message.guild.id, { logs: { invite: null } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'default' || value === 'enable') {
                        this.client.settings.update(message.guild.id, { logs: { invite: '--enabled' } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'embed') {
                        this.client.settings.update(message.guild.id, { logs: { invite: '--embed' } }).then(() => message.success('Setting successfully updated.'));
                    } else {
                        this.client.settings.update(message.guild.id, { logs: { invite: value } }).then(() => message.success('Setting successfully updated.'));
                    }
                } else if (setting === 'logs-say') {
                    if (!message.guild.settings.logs.id) return message.error('You must have a logs channel set up before changing this setting.');

                    if (value === 'disable') {
                        this.client.settings.update(message.guild.id, { logs: { say: null } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'default' || value === 'enable') {
                        this.client.settings.update(message.guild.id, { logs: { say: '--enabled' } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'embed') {
                        this.client.settings.update(message.guild.id, { logs: { say: '--embed' } }).then(() => message.success('Setting successfully updated.'));
                    } else {
                        this.client.settings.update(message.guild.id, { logs: { say: value } }).then(() => message.success('Setting successfully updated.'));
                    }
                } else if (setting === 'modlogs' || setting === 'logs-moderation') {
                    if (value === 'disable') {
                        this.client.settings.update(message.guild.id, { logs: { moderation: null } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'here') {
                        this.client.settings.update(message.guild.id, { logs: { moderation: message.channel.id } }).then(() => message.success('Setting successfully updated.'));
                    } else {
                        const subArgs = /(?:(?:<#)?(\d{17,20})>?|(.+))/i.exec(value);

                        const channel = subArgs[1] ? message.guild.channels.get(subArgs[1]) : message.guild.channels.find((c) => c.name.toLowerCase() === subArgs[2].toLowerCase());
                        if (!channel) return message.error('Invalid channel. Please make sure your spelling is correct, and that the channel actually exists.');
                        if (channel.type !== 'text') return message.error('The channel must be a text channel.');

                        this.client.settings.update(message.guild.id, { logs: { moderation: channel.id } }).then(() => message.success('Setting successfully updated.'));
                    }
                } else if (setting === 'modlogs-purge') {
                    if (value === 'disable') {
                        this.client.settings.update(message.guild.id, { logs: { purge: false } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'enable') {
                        this.client.settings.update(message.guild.id, { logs: { purge: true } }).then(() => message.success('Setting successfully updated.'));
                    } else {
                        message.error('An invalid option was given.');
                    }
                } else if (setting === 'automessage') {
                    if (value === 'disable') {
                        this.client.settings.update(message.guild.id, { auto: { message: null } }).then(() => message.success('Setting successfully updated.'));
                    } else {
                        this.client.settings.update(message.guild.id, { auto: { message: value } }).then(() => message.success('Setting successfully updated.'));
                    }
                } else if (setting === 'autonickname') {
                    if (value === 'disable') {
                        this.client.settings.update(message.guild.id, { auto: { nickname: null } }).then(() => message.success('Setting successfully updated.'));
                    } else {
                        if (value.length > 20) return message.error('Autonickname must contain no more than 20 characters.');
                        if (!value.includes('{user.name}')) return message.error('Autonickname must contain the `{user.name}` placeholder.');

                        this.client.settings.update(message.guild.id, { auto: { nickname: value } }).then(() => message.success('Setting successfully updated.'));
                    }
                } else if (setting === 'mode') {
                    if (value === 'free') {
                        this.client.settings.update(message.guild.id, { mode: 'free' }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'lite') {
                        this.client.settings.update(message.guild.id, { mode: 'lite' }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'strict') {
                        this.client.settings.update(message.guild.id, { mode: 'strict' }).then(() => message.success('Setting successfully updated.'));
                    } else {
                        message.error('Mode must be either `free`, `lite`, or `strict`.');
                    }
                } else if (setting === 'customprefix') {
                    if (value === 'disable') {
                        if (!message.guild.settings.prefix.default) this.client.settings.update(message.guild.id, { prefix: { default: true } });

                        this.client.settings.update(message.guild.id, { prefix: { custom: null } }).then(() => message.success('Setting successfully updated.'));
                    } else {
                        if (value.length > 5) return message.error('Your custom prefix must contain no more than 5 characters.');

                        this.client.settings.update(message.guild.id, { prefix: { custom: value } }).then(() => message.success('Setting successfully updated.'));
                    }
                } else if (setting === 'defaultprefix') {
                    if (value === 'disable') {
                        if (!message.guild.settings.prefix.custom) return message.error('You must have a custom prefix set up to disable this.');

                        this.client.settings.update(message.guild.id, { prefix: { default: false } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'enable') {
                        this.client.settings.update(message.guild.id, { prefix: { default: true } }).then(() => message.success('Setting successfully updated.'));
                    } else {
                        message.error('An invalid option was given.');
                    }
                } else if (setting === 'antiinvite') {
                    if (value === 'disable') {
                        this.client.settings.update(message.guild.id, { automod: { invite: false } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'enable') {
                        this.client.settings.update(message.guild.id, { automod: { invite: true } }).then(() => message.success('Setting successfully updated.'));
                    } else {
                        message.error('An invalid option was given.');
                    }
                } else if (setting === 'antiinvite-action') {
                    if (value === 'disable') {
                        this.client.settings.update(message.guild.id, { automod: { inviteaction: false } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'enable') {
                        this.client.settings.update(message.guild.id, { automod: { inviteaction: true } }).then(() => message.success('Setting successfully updated.'));
                    } else {
                        message.error('An invalid option was given.');
                    }
                } else if (setting === 'antiinvite-warn') {
                    if (value === 'disable' || value == '0') {
                        this.client.settings.update(message.guild.id, { automod: { invitewarn: 0 } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'default') {
                        this.client.settings.update(message.guild.id, { automod: { invitewarn: 1 } }).then(() => message.success('Setting successfully updated.'));
                    } else {
                        const n = Number(value);

                        if (isNaN(n)) return message.error('The given value is not a number.');
                        if (n < 0) return message.error('A negative number is not acceptable.');
                        if (n > 10) return message.error('This limit cannot exceed 10.');

                        this.client.settings.update(message.guild.id, { automod: { invitewarn: n } }).then(() => message.success('Setting successfully updated.'));
                    }
                } else if (setting === 'antiinvite-kick') {
                    if (value === 'disable' || value == '0') {
                        this.client.settings.update(message.guild.id, { automod: { invitekick: 0 } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'default') {
                        this.client.settings.update(message.guild.id, { automod: { invitekick: 3 } }).then(() => message.success('Setting successfully updated.'));
                    } else {
                        const n = Number(value);

                        if (isNaN(n)) return message.error('The given value is not a number.');
                        if (message.guild.settings.automod.invitewarn > 0 && n <= message.guild.settings.automod.invitewarn) return message.error('This limit cannot be equal to or less than the antiinvite-warn limit.');
                        if (n < 0) return message.error('A negative number is not acceptable.');
                        if (n > 10) return message.error('This limit cannot exceed 10.');

                        this.client.settings.update(message.guild.id, { automod: { invitekick: n } }).then(() => message.success('Setting successfully updated.'));
                    }
                } else if (setting === 'nonickname') {
                    if (value === 'disable') {
                        this.client.settings.update(message.guild.id, { nonickname: false }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'enable') {
                        this.client.settings.update(message.guild.id, { nonickname: true }).then(() => message.success('Setting successfully updated.'));
                    } else {
                        message.error('An invalid option was given.');
                    }
                } else if (setting === 'music-permissions') {
                    if (value === 'disable' || value === 'default' || value === 'all') {
                        this.client.settings.update(message.guild.id, { music: { default: 'all' } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'dj') {
                        this.client.settings.update(message.guild.id, { music: { default: 'dj' } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'moderator') {
                        this.client.settings.update(message.guild.id, { music: { default: 'moderator' } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'administrator') {
                        this.client.settings.update(message.guild.id, { music: { default: 'administrator' } }).then(() => message.success('Setting successfully updated.'));
                    } else {
                        message.error('An invalid option was given.');
                    }
                } else if (setting === 'music-play') {
                    if (value === 'disable' || value === 'default' || value === 'off') {
                        this.client.settings.update(message.guild.id, { music: { play: 'off' } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'all') {
                        this.client.settings.update(message.guild.id, { music: { play: 'all' } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'dj') {
                        this.client.settings.update(message.guild.id, { music: { play: 'dj' } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'moderator') {
                        this.client.settings.update(message.guild.id, { music: { play: 'moderator' } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'administrator') {
                        this.client.settings.update(message.guild.id, { music: { play: 'administrator' } }).then(() => message.success('Setting successfully updated.'));
                    } else {
                        message.error('An invalid option was given.');
                    }
                } else if (setting === 'music-skip') {
                    if (value === 'disable' || value === 'default' || value === 'off') {
                        this.client.settings.update(message.guild.id, { music: { skip: 'off' } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'all') {
                        this.client.settings.update(message.guild.id, { music: { skip: 'all' } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'dj') {
                        this.client.settings.update(message.guild.id, { music: { skip: 'dj' } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'moderator') {
                        this.client.settings.update(message.guild.id, { music: { skip: 'moderator' } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'administrator') {
                        this.client.settings.update(message.guild.id, { music: { skip: 'administrator' } }).then(() => message.success('Setting successfully updated.'));
                    } else {
                        message.error('An invalid option was given.');
                    }
                } else if (setting === 'music-stop') {
                    if (value === 'disable' || value === 'default' || value === 'off') {
                        this.client.settings.update(message.guild.id, { music: { stop: 'off' } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'all') {
                        this.client.settings.update(message.guild.id, { music: { stop: 'all' } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'dj') {
                        this.client.settings.update(message.guild.id, { music: { stop: 'dj' } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'moderator') {
                        this.client.settings.update(message.guild.id, { music: { stop: 'moderator' } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'administrator') {
                        this.client.settings.update(message.guild.id, { music: { stop: 'administrator' } }).then(() => message.success('Setting successfully updated.'));
                    } else {
                        message.error('An invalid option was given.');
                    }
                } else if (setting === 'music-pause') {
                    if (value === 'disable' || value === 'default' || value === 'off') {
                        this.client.settings.update(message.guild.id, { music: { pause: 'off' } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'all') {
                        this.client.settings.update(message.guild.id, { music: { pause: 'all' } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'dj') {
                        this.client.settings.update(message.guild.id, { music: { pause: 'dj' } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'moderator') {
                        this.client.settings.update(message.guild.id, { music: { pause: 'moderator' } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'administrator') {
                        this.client.settings.update(message.guild.id, { music: { pause: 'administrator' } }).then(() => message.success('Setting successfully updated.'));
                    } else {
                        message.error('An invalid option was given.');
                    }
                } else if (setting === 'music-resume') {
                    if (value === 'disable' || value === 'default' || value === 'off') {
                        this.client.settings.update(message.guild.id, { music: { resume: 'off' } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'all') {
                        this.client.settings.update(message.guild.id, { music: { resume: 'all' } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'dj') {
                        this.client.settings.update(message.guild.id, { music: { resume: 'dj' } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'moderator') {
                        this.client.settings.update(message.guild.id, { music: { resume: 'moderator' } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'administrator') {
                        this.client.settings.update(message.guild.id, { music: { resume: 'administrator' } }).then(() => message.success('Setting successfully updated.'));
                    } else {
                        message.error('An invalid option was given.');
                    }
                } else if (setting === 'music-unqueue') {
                    if (value === 'disable' || value === 'default' || value === 'off') {
                        this.client.settings.update(message.guild.id, { music: { unqueue: 'off' } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'all') {
                        this.client.settings.update(message.guild.id, { music: { unqueue: 'all' } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'dj') {
                        this.client.settings.update(message.guild.id, { music: { unqueue: 'dj' } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'moderator') {
                        this.client.settings.update(message.guild.id, { music: { unqueue: 'moderator' } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'administrator') {
                        this.client.settings.update(message.guild.id, { music: { unqueue: 'administrator' } }).then(() => message.success('Setting successfully updated.'));
                    } else {
                        message.error('An invalid option was given.');
                    }
                } else if (setting === 'music-volume') {
                    if (value === 'disable' || value === 'default' || value === 'off') {
                        this.client.settings.update(message.guild.id, { music: { volume: 'off' } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'all') {
                        this.client.settings.update(message.guild.id, { music: { volume: 'all' } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'dj') {
                        this.client.settings.update(message.guild.id, { music: { volume: 'dj' } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'moderator') {
                        this.client.settings.update(message.guild.id, { music: { volume: 'moderator' } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'administrator') {
                        this.client.settings.update(message.guild.id, { music: { volume: 'administrator' } }).then(() => message.success('Setting successfully updated.'));
                    } else {
                        message.error('An invalid option was given.');
                    }
                } else if (setting === 'music-timelimit') {
                    if (value === 'default') {
                        this.client.settings.update(message.guild.id, { music: { timelimit: null } }).then(() => message.success('Setting successfully updated.'));
                    } else {
                        const n = Number(value);

                        if (isNaN(n)) return message.error('The given value is not a number.');
                        if (n < 120) return message.error('The minimum value for this setting is 120 seconds (2 minutes).');

                        if (n > 600 && accessLevel.level < 1) return message.error('The maximum value for this setting is 600 seconds (10 minutes) for servers whose owner is not a TypicalBot Prime member.');
                        if (n > 7200) return message.error('The maximum value for this setting is 7200 seconds (2 hours).');

                        this.client.settings.update(message.guild.id, { music: { timelimit: n } }).then(() => message.success('Setting successfully updated.'));
                    }
                } else if (setting === 'music-queuelimit') {
                    if (value === 'disable' || value == '0') {
                        this.client.settings.update(message.guild.id, { music: { queuelimit: 0 } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'default') {
                        this.client.settings.update(message.guild.id, { music: { queuelimit: null } }).then(() => message.success('Setting successfully updated.'));
                    } else {
                        const n = Number(value);

                        if (isNaN(n)) return message.error('The given value is not a number.');
                        if (n < 1) return message.error('The minimum value for this setting is 0 videos (disabled).');

                        if (n > 10 && accessLevel.level < 1) return message.error('The maximum value for this setting is 10 videos for servers whose owner is not a TypicalBot Prime member.');
                        if (n > 100) return message.error('The maximum value for this setting is 100 videos.');

                        this.client.settings.update(message.guild.id, { music: { queuelimit: n } }).then(() => message.success('Setting successfully updated.'));
                    }
                } else if (setting === 'starboard') {
                    if (value === 'disable') {
                        this.client.settings.update(message.guild.id, { starboard: { id: null } }).then(() => message.success('Setting successfully updated.'));
                    } else if (value === 'here') {
                        this.client.settings.update(message.guild.id, { starboard: { id: message.channel.id } }).then(() => message.success('Setting successfully updated.'));
                    } else {
                        const subArgs = /(?:(?:<#)?(\d{17,20})>?|(.+))/i.exec(value);

                        const channel = subArgs[1] ? message.guild.channels.get(subArgs[1]) : message.guild.channels.find((c) => c.name.toLowerCase() === subArgs[2].toLowerCase());
                        if (!channel) return message.error('Invalid channel. Please make sure your spelling is correct, and that the channel actually exists.');
                        if (channel.type !== 'text') return message.error('The channel must be a text channel.');

                        this.client.settings.update(message.guild.id, { starboard: { id: channel.id } }).then(() => message.success('Setting successfully updated.'));
                    }
                } else if (setting === 'starboard-stars') {
                    if (value === 'default') {
                        this.client.settings.update(message.guild.id, { starboard: { count: 5 } }).then(() => message.success('Setting successfully updated.'));
                    } else {
                        const n = Number(value);

                        if (isNaN(n)) return message.error('The given value is not a number.');
                        if (n < 1) return message.error("You can't star a message without at least one star.");
                        if (n > 10) return message.error('The maximum value for this setting is 10 stars.');

                        this.client.settings.update(message.guild.id, { starboard: { count: n } }).then(() => message.success('Setting successfully updated.'));
                    }
                } else {
                    message.error("The requested setting doesn't exist");
                }
            } else return message.error(this.client.functions.error('usage', this));
        }
    }
};
