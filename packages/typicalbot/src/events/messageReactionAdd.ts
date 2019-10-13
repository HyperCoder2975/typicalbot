import { MessageEmbed, MessageReaction, TextChannel } from 'discord.js';
import Event from '../structures/Event';
import { TypicalGuildMessage } from '../types/typicalbot';

export default class MessageReactionAdd extends Event {
    async execute(messageReaction: MessageReaction) {
        const message = messageReaction.message as TypicalGuildMessage;

        if (message.partial) await message.fetch();

        if (
            message.channel.type !== 'text' ||
            !message.guild ||
            !message.guild.available
        )
            return;
        if (messageReaction.emoji.name !== '⭐') return;

        const settings = (message.guild.settings = await message.guild.fetchSettings());

        if (
            !settings.starboard.id ||
            settings.ignored.stars.includes(message.channel.id)
        )
            return;

        let { count } = messageReaction;
        if (messageReaction.users.get(message.author.id)) count--;

        if (count < settings.starboard.count) return;

        const channel = message.guild.channels.get(
            settings.starboard.id
        ) as TextChannel;
        if (!channel || channel.type !== 'text') return;

        const messages = await channel.messages.fetch({ limit: 100 });
        const boardMsg = messages.find(m => {
            if (!m.embeds.length) return false;
            const [embed] = m.embeds;
            if (
                !embed.footer ||
                !embed.footer.text ||
                !embed.footer.text.startsWith('⭐') ||
                !embed.footer.text.endsWith(message.id)
            )
                return false;
            return true;
        });

        if (boardMsg) {
            const [boardEmbed] = boardMsg.embeds;

            return boardMsg.edit({
                embed: boardEmbed.setFooter(`⭐ ${count} | ${message.id}`)
            });
        }

        const image =
            message.attachments.size > 0
                ? message.attachments.array()[0].url
                : null;

        const embed = new MessageEmbed()
            .setColor(0xffa500)
            .addField(
                message.translate('common:AUTHOR'),
                message.author.toString(),
                true
            )
            .addField(message.channel.toString(), true)
            .setThumbnail(
                message.author.displayAvatarURL({ format: 'png', size: 2048 })
            )
            .setTimestamp(message.createdAt)
            .setFooter(`⭐ ${count} | ${message.id}`);

        if (image) {
            embed.setImage(image);
        } else {
            embed.addField(
                message.translate('common:MESSAGE'),
                message.content,
                false
            );
        }

        return channel.send({ embed });
    }
}
