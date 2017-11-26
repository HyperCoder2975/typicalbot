const Store = require("../structures/Store");
const path = require("path");

class CommandStore extends Store {
    constructor(client) {
        super(client, "commands", path.join(__dirname, "..", "commands"));

        this.loadAll();
    }

    _get(name) {
        return super.get(name);
    }

    async get(text, aliases) {
        if (this.has(text)) return super.get(text);
        if (this.find(c => c.aliases.includes(text))) return super.find(c => c.aliases.includes(text));
        if (aliases && aliases.map(x => x.alias).includes(text)) return super.get(aliases[aliases.map(x => x.alias).indexOf(text)].command);
        return null;
    }

    async reload(command) {
        delete require.cache[command.path];

        const file = require(command.path);
        const req = new file(this.client, command.name, command.path);

        this.set(req.name, req);
    }
}

module.exports = CommandStore;
