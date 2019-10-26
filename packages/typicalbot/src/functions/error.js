const Function = require('../structures/Function');

class Error extends Function {
    constructor(client, name) {
        super(client, name);
    }

    execute(error, ...args) {
        if (error === 'usage') {
            const [command] = args;

            return `Invalid command usage. Check \`${process.env.PREFIX}help ${command.name}\` for more information.`;
        } if (error === 'perms') {
            const [command, uLevel] = args;
            const rLevel = this.client.handlers.permissions.levels.get(command.permission);

            return `Your permission level is too low to execute that command. The command requires permission level ${rLevel.level} (${rLevel.title}) and you are level ${uLevel.level} (${uLevel.title}).`;
        } if (error === 'elevation') {
            const [command, uLevel, rLevel] = args;
            const rrLevel = this.client.handlers.permissions.levels.get(rLevel);

            return `This server requires elevated permissions to use that command. The command requires permission level ${rrLevel.level} (${rrLevel.title}) and you are level ${uLevel.level} (${uLevel.title}).`;
        }
    }
}

module.exports = Error;
