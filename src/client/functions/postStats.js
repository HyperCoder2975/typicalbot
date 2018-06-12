const Function = require("../structures/Function");
const request = require("superagent");

class New extends Function {
    constructor(client, name) {
        super(client, name);
    }

    execute(provider) {
        if (provider === "a" || provider === "c") {
            request.post("https://www.carbonitex.net/discord/data/botdata.php")
                .set("Content-Type", "application/json")
                .send({
                    "shardid": this.client.shardID.toString(),
                    "shardcount": this.client.shardCount.toString(),
                    "servercount": this.client.guilds.size.toString(),
                    "key": this.client.config.apis.carbon
                })
                .end((err, res) => {
                    if (err || res.statusCode != 200) this.client.handlers.process.log(`Carbinitex Stats Transfer Failed ${err.body || err}`, true);
                });
        } else if (provider === "a" || provider === "b") {
            request.post("https://bots.discord.pw/api/bots/153613756348366849/stats")
                .set("Authorization", this.client.config.apis.discordbots)
                .set("Content-Type", "application/json")
                .send({
                    "shard_id": this.client.shardID.toString(),
                    "shard_count": this.client.shardCount.toString(),
                    "server_count": this.client.guilds.size.toString()
                })
                .end((err, res) => {
                    if (err || res.statusCode != 200) this.client.handlers.process.log("bots.discord.pw Stats Transfer Failed", true);
                });
        }
    }
}

module.exports = New;
