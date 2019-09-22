const PermissionLevelStr = require('../structures/PermissionLevel');
const Constants = require('../utility/Constants');

class ServerBlacklisted extends PermissionLevelStr {
    constructor() {
        super({
            title: 'Server Blacklisted',
            level: Constants.Permissions.Levels.SERVER_BLACKLISTED,
        });
    }

    check(guild, member) {
        const roles = PermissionLevelStr.fetchRoles(guild, 'blacklist');
        if (!roles.length) return false;

        for (const role of roles) if (member.roles.has(role)) return true;

        return false;
    }
}

module.exports = ServerBlacklisted;
