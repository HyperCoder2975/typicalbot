const Command = require('../../structures/Command');

const Constants = require('../../utility/Constants');

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            description: 'Stop what is currently playing.',
            usage: 'stop',
            mode: Constants.Modes.LITE,
        });
    }

    async execute(message) {
        if (!await this.client.utility.music.hasPermissions(message, this)) return;

        try {
            const { connection } = message.guild.voice;

            if (!connection) return message.send('Nothing is currently streaming.');
            if (!message.member.voice.channel || message.member.voice.channel.id !== connection.channel.id) return message.error('You must be in the same voice channel to perform that command.');

            connection.guildStream.end();

            message.reply('Stopping all streaming audio.');
        } catch (e) {
            message.send('Nothing is currently streaming.');
        }
    }
};
