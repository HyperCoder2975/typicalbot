const Command = require("../../structures/Command");

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            description: "Streams a song to a voice channel from YouTube.",
            usage: "play <video-name|url>",
            mode: "lite",
            access: 1
        });
    }

    execute(message, parameters, permissionLevel) {
        if (!this.client.audioUtility.hasPermissions(message, this)) return;

        const match = /(.+)/i.exec(message.content);
        if (!match) return message.error(this.client.functions.error("usage", this));

        const url = /(?:https?:\/\/)?(?:(?:www|m)\.)?(?:youtube\.com|youtu\.be)\/(.+)/i.exec(match[1]);

        if (url) {
            this.client.audioUtility.fetchInfo(url[1]).then(videoInfo => {
                videoInfo.url = url[1];
                return this.client.audioManager.stream(message, videoInfo);
            }).catch(err => message.error(`Information cannot be fetched from that song. Please try another url.`));
        } else {
            this.client.audioUtility.search(message.guild.settings, match[1]).then(results => {
                if (!results.length) return message.reply(`No results were found for the query **${match[1]}**.`);
                const video = results[0];

                this.client.audioUtility.fetchInfo(video.url).then(videoInfo => {
                    videoInfo.url = video.url;
                    this.client.audioManager.stream(message, videoInfo).catch(err => message.error(`An error occured while trying to stream a song.${message.author.id === "105408136285818880" ? `\n\n\`\`\`${err}\`\`\`` : ""}`));
                }).catch(err => message.error(`Information cannot be fetched from that song. Please try another song name.${message.author.id === "105408136285818880" ? `\n\n\`\`\`${err}\`\`\`` : ""}`));
            }).catch(error => message.error(`${this.client.audioUtility.searchError(error)}`));
        }
    }
};
