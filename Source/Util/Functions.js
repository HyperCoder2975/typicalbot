const request = require("request");
const moment = require("moment");

module.exports = class Functions {
    constructor(client) {
        this.client = client;
    }

    timestamp(ms) {
        let days = ms / 86400000;
        let d = Math.floor(days);
        let hours = (days - d) * 24;
        let h = Math.floor(hours);
        let minutes = (hours - h) * 60;
        let m = Math.floor(minutes);
        let seconds = (minutes - m) * 60;
        let s = Math.floor(seconds);
        return { d, h, m, s };
    }

    time(ts) {
        let d = ts.d > 0 ? ts.d === 1 ? "1 day" : `${ts.d} days` : null;
        let h = ts.h > 0 ? ts.h === 1 ? "1 hour" : `${ts.h} hours` : null;
        let m = ts.m > 0 ? ts.m === 1 ? "1 minute" : `${ts.m} minutes` : null;
        let s = ts.s > 0 ? ts.s === 1 ? "1 second" : `${ts.s} seconds` : null;
        let l = [];
        if (d) l.push(d); if (h) l.push(h); if (m) l.push(m); if (s) l.push(s);
        return l.join(", ");
    }

    length(s) {
        return this.time(this.timestamp(s * 1000));
    }

    shorten(text, length = 45) {
        if (text.length > length) return `${text.substring(0, length - 3)}...`;
        return text;
    }

    lengthen(text, length, place = "after") {
        text = text.toString();
        if (text.length > 20) return `${text.substring(0, 17)}...`;
        if (place === "before") {
            for (let i = text.length; i < length; i++) text = ` ${text}`;
            return text;
        } else if (place === "after") {
            for (let i = text.length; i < length; i++) text = `${text} `;
            return text;
        }
    }

    inviteCheck(message) {
        if (message.guild.settings.antiinvite === "Y") {
            let match = /(discord\.gg\/.+|discordapp\.com\/invite\/.+)/gi.test(message.content);
            if (match && message.deletable) {
                this.client.events.guildInvitePosted(message.guild, message.channel, message.author);
                message.delete().then(() => {
                    message.channel.sendMessage(`${message.author} | \`❗\` | Your message contained a server invite link, which this server prohibits.`);
                });
            }
        }
    }

    get uptime() {
        return this.time(this.timestamp(this.client.uptime));
    }

    fetchRole(guild, settings, role) {
        let setting = settings[role] || null;
        if (setting && guild.roles.has(setting)) return guild.roles.get(setting);
        if (role === "joinrole") return;
        if (role === "masterrole") {
            let orole = guild.roles.find("name", "TypicalBot Admin");
            if (orole) return orole;
        } else if (role === "modrole") {
            let orole = guild.roles.find("name", "TypicalBot Mod");
            if (orole) return orole;
        } else if (role === "blacklist") {
            let orole = guild.roles.find("name", "TypicalBot Blacklist");
            if (orole) return orole;
        }
        return null;
    }

    getPermissionLevel(guild, settings, user, ignorestaff = false) {
        let member = guild.member(user);
        if (!member) return 0;
        if (user.id === this.client.config.owner) return 6;
        if (!ignorestaff && this.client.config.staff[user.id]) return 5;
        if (!ignorestaff && this.client.config.support[user.id]) return 4;
        if (user.id === guild.ownerID) return 3;
        let masterrole = this.fetchRole(guild, settings, "masterrole");
        if (masterrole && member.roles.has(masterrole.id)) return 2;
        let modrole = this.fetchRole(guild, settings, "modrole");
        if (modrole && member.roles.has(modrole.id)) return 1;
        let blacklist = this.fetchRole(guild, settings, "blacklist");
        if (blacklist && member.roles.has(blacklist.id)) return -1;
        return 0;
    }

    getPrefix(settings, command) {
        if (settings.customprefix && command.startsWith(settings.customprefix)) return settings.customprefix;
        if (settings.originaldisabled === "N" && command.startsWith(this.client.config.prefix)) return this.client.config.prefix;
        return null;
    }

    checkGuildBan(guild, user) {
        return new Promise((resolve, reject) => {
            if (!guild) return reject();
            let BotMember = guild.member(this.client.user);
            if (!BotMember || !BotMember.hasPermission("BAN_MEMBERS")) return resolve(false);
            guild.fetchBans().then(bans => {
                if (bans.has(user.id)) return resolve(true);
                return resolve(false);
            });
        });
    }

    messageable(channel) {
        let ClientMember = channel.guild.member(this.client.user);
        let Permissions = channel.permissionsFor(ClientMember);
        if (!Permissions.hasPermission("SEND_MESSAGES")) return false;
        return true;
    }

    nicknameable(member) {
        let ClientMember = member.guild.member(this.client.user);
        let Permissions = ClientMember.permissions;
        if (!Permissions.hasPermission("MANAGE_NICKNAMES")) return false;
        return ClientMember.highestRole.comparePositionTo(member.highestRole) > 0;
    }

    getFilteredMessage(type, guild, user, text, options = {}) {
        let member = guild.member(user);
        text = text
            .replace(/@everyone/gi, `@\u200Beveryone`)
            .replace(/@here/g, `@\u200Bhere`);
//            .replace(/`/g, `\`\u200B`);
        if (type === "ann") return text
            .replace(/{user}|{user.mention}/gi, user.toString())
            .replace(/{user.name}/gi, user.username)
            .replace(/{user.id}/gi, user.id)
            .replace(/{user.avatar}/, user.avatarURL)
            .replace(/{user.discrim}|{user.discriminator}/gi, user.discriminator)
            .replace(/{user.created}/, user.createdAt)
            .replace(/{user.createdembed}/, JSON.stringify(user.createdAt).replace(/"/g, ""))
            .replace(/{user.shortcreated}/, moment(user.createdAt).format("MMM DD, YYYY @ hh:mm A"))
            .replace(/{guild.name}|{server.name}/gi, guild.name)
            .replace(/{guild.id}|{server.id}/gi, guild.id)
            .replace(/{now}/gi, JSON.stringify(new Date()).replace(/"/g, ""));
        if (type === "ann-nick") return this.getFilteredMessage("ann", guild, user, text)
            .replace(/{user.nick}|{user.nickname}/gi, member.nickname || user.username)
            .replace(/{user.oldnick}|{user.oldnickname}/gi, options.oldMember.nickname || user.username);
        if (type === "ann-invite") return this.getFilteredMessage("ann", guild, user, text)
            .replace(/{user.nick}|{user.nickname}/gi, member.nickname || user.username)
            .replace(/{channel}/gi, options.channel.toString())
            .replace(/{channel.name}/gi, options.channel.name)
            .replace(/{channel.id}/gi, options.channel.id);
        if (type === "jm") return text
            .replace(/{user.name}/gi, user.username)
            .replace(/{user.id}/gi, user.id)
            .replace(/{user.discrim}|{user.discriminator}/gi, user.discriminator)
            .replace(/{guild.name}|{server.name}/gi, guild.name)
            .replace(/{guild.id}|{server.id}/gi, guild.id);
        if (type === "jn") return text
            .replace(/{user.name}/gi, user.username)
            .replace(/{user.discrim}/gi, user.discriminator)
            .replace(/{user.discriminator}/gi, user.discriminator);
    }

    request(url) {
        return new Promise((resolve, reject) => {
            request(url, (error, response, body) =>{
                if (error || response.statusCode !== 200) return reject({error: error, response: response});
                return resolve(body);
            });
        });
    }
};
