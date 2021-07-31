import {
    DMChannel,
    Message,
    MessageAttachment,
    MessageEmbed,
    Structures,
} from 'discord.js';

export class TypicalMessage extends Structures.get('Message') {
    menuResponse?: Message = undefined;

    get embeddable() {
        if (
            !this.guild ||
            !this.guild.me ||
            !this.guild.settings ||
            !this.guild.settings.embed ||
            this.channel instanceof DMChannel
        )
            return false;

        const perms = this.channel.permissionsFor(this.guild.me);
        if (!perms) return false;

        return perms.has('EMBED_LINKS');
    }

    async ask(question: string) {
        this.menuResponse = this.menuResponse ? await this.menuResponse.edit(question) : await this.respond(question);

        const responses = await this.channel.awaitMessages((msg) =>
            msg.author.id === this.author.id, { time: 15000, max: 1 });
        return responses.first();
    }

    async chooseOption(options: string[]) {
        const response = await this.ask([
            this.translate('misc:CHOOSE_OPTION_1'),
            '\n',
            this.translate('misc:CHOOSE_OPTION_2', { options: options.map((opt, index) => `**${index + 1}** - ${opt}`).join('\n') })
        ].join('\n'));

        if (!response) {
            this.menuResponse?.delete().catch(() => undefined);
            return;
        }

        const CANCEL_OPTIONS = this.translate('misc:CANCEL_OPTIONS', { returnObjects: true });
        if (CANCEL_OPTIONS.includes(response.content.toLowerCase())) {
            if (response.deletable) response.delete().catch(() => undefined);
            this.menuResponse?.delete().catch(() => undefined);
            await this.respond(this.translate('misc:CANCELLED'));
            return;
        }

        const number = Number(response.content);
        if (!number || number > options.length) {
            this.menuResponse?.delete().catch(() => undefined);
            return;
        }

        if (response.deletable) response.delete().catch(() => undefined);

        return options[Math.floor(number) - 1];
    }

    respond(content: string, embed?: MessageEmbed) {
        return this.channel.send({ content: `${this.author} | ${content}`, embed });
    }

    send(content: string,
        embed?: MessageEmbed) {
        return this.channel.send({ content, embed, allowedMentions: { parse: [] } });
    }

    embed(embed: MessageEmbed) {
        return this.channel.send({ embed });
    }

    attachment(attachment: MessageAttachment) {
        return this.channel.send({ files: [attachment] });
    }

    success(content: string, embed?: MessageEmbed) {
        return this.channel.send({ content: `${this.author} | ✔️ | ${content}`, embed });
    }

    error(content: string, embed?: MessageEmbed) {
        return this.channel.send({ content: `${this.author} | ❌ | ${content}`, embed });
    }

    dm(content: string,
        embed?: MessageEmbed) {
        return this.author?.send({ content, embed });
    }

    translate(key: string, args?: Record<string, unknown>) {
        const language = this.client.translate.get(this.guild ? this.guild.settings.language : 'en-US');

        if (!language) throw new Error('Message: Invalid language set in settings.');

        return language(key, args);
    }
}

Structures.extend('Message', () => TypicalMessage);
