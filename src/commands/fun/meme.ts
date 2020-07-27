import fetch from 'node-fetch';
import Command from '../../lib/structures/Command';
import { TypicalGuildMessage } from '../../lib/types/typicalbot';
import { MessageEmbed } from 'discord.js';

export default class extends Command {
    async execute(message: TypicalGuildMessage) {
        const { data: { children } } = await fetch('https://www.reddit.com/r/memes/top.json?sort=top&t=day&limit=500')
            .then(res => res.json());

        const raw = children.filter((c: any) => c.data.over_18 === false);

        if (raw.length === 0)
            return message.error(message.translate('fun/meme:MEME_ERROR'));

        const meme = raw[Math.floor(Math.random() * raw.length)].data;

        if (!message.embeddable)
            return message.send([
                meme.title,
                meme.url
            ].join('\n'));

        return message.send(new MessageEmbed()
            .setTitle(meme.title)
            .setImage(meme.url)
            .setColor(0x1976D2)
            .setAuthor(message.author.tag, message.author.displayAvatarURL())
            .setFooter(`👍 ${meme.ups} | 👎 ${meme.downs}`));
    }
}
