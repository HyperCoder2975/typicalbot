const { Client } = require("discord.js");

const build = process.env.CLIENT_BUILD;
const config = require(`../configs/${build}`);

const EventStore = require("./stores/Events.js");

new class TypicalBot extends Client {
    constructor() {
        super(config.clientOptions);

        this.build = build;
        this.config = config;

        this.shardID = Number(process.env.SHARD_ID);
        this.shardNumber = Number(process.env.SHARD_ID) + 1;
        this.shardCount = Number(process.env.SHARD_COUNT);

        this.events = new EventStore(this);

        this.login(config.token);
    }

    log(content, error = false) {
        error ?
            console.error(content) :
            console.log(content);
    }
};

process.on("uncaughtException", err => console.error(err.stack));
