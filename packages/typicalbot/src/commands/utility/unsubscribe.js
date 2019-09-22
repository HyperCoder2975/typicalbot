const Command = require('../../structures/Command');

const Constants = require('../../utility/Constants');

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            description: "Remove the server's subscriber role from yourself.",
            usage: 'unsubscribe',
            mode: Constants.Modes.STRICT,
        });
    }

    execute(message) {
        const role = message.guild.settings.subscriber ? message.guild.roles.get(message.guild.settings.subscriber) : null;

        if (!role) return message.error('No subscriber role is set up for this server.');

        message.member.roles.remove(role).then(() => {
            message.reply('You are now unsubscribed!');
        });
    }

    embedExecute(message) {
        const role = message.guild.settings.subscriber ? message.guild.roles.get(message.guild.settings.subscriber) : null;

        if (!role) {
            return message.buildEmbed()
                .setColor(0xFF0000)
                .setTitle('Error')
                .setDescription('No subscriber role is set up for this server.')
                .setFooter('TypicalBot', Constants.Links.ICON)
                .setTimestamp()
                .send();
        }

        message.member.roles.remove(role).then(() => {
            message.buildEmbed()
                .setColor(0x00adff)
                .setTitle('Success')
                .setDescription('You are no longer subscribed!')
                .setFooter('TypicalBot', Constants.Links.ICON)
                .setTimestamp()
                .send();
        });
    }
};
