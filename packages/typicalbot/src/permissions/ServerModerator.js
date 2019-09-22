const PermissionLevelStr = require('../structures/PermissionLevel');
const Constants = require('../utility/Constants');

class ServerModerator extends PermissionLevelStr {
    constructor() {
        super({
            title: 'Server Moderator',
            level: Constants.Permissions.Levels.SERVER_MODERATOR,
        });
    }

    check(guild, member) {
        const roles = PermissionLevelStr.fetchRoles(guild, 'moderator');
        if (!roles.length) return false;

        for (const role of roles) if (member.roles.has(role)) return true;

        return false;
    }
}

module.exports = ServerModerator;
