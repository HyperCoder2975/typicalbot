const Command = require('../../structures/Command');

const Constants = require('../../utility/Constants');

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            description: "Gain the server's subscriber role.",
            usage: 'subscribe',
            mode: Constants.Modes.STRICT,
        });
    }

    execute(message) {
        const role = message.guild.settings.subscriber ? message.guild.roles.get(message.guild.settings.subscriber) : null;

        if (!role) return message.error('No subscriber role is set up for this server.');

        message.member.roles.add(role).then(() => {
            message.reply('You are now subscribed!');
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

        const Role = message.guild.roles.find((r) => r.name === 'Subscriber');

        message.member.roles.add(role).then(() => {
            message.buildEmbed()
                .setColor(0x00adff)
                .setTitle('Success')
                .setDescription('You are now subscribed!')
                .setFooter('TypicalBot', Constants.Links.ICON)
                .setTimestamp()
                .send();
        });
    }
};
