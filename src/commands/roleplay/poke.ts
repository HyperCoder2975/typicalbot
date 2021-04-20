import Command from '../../lib/structures/Command';
import { TypicalGuildMessage } from '../../lib/types/typicalbot';

export default class extends Command {
    execute(message: TypicalGuildMessage) {
        const mention = message.mentions.users.first();

        if (!mention || mention.id === message.author.id)
            return message.reply(message.translate('roleplay/poke:SELF'));

        return message.reply(message.translate('roleplay/poke:RESPONSE', {
            user: mention.toString()
        }));
    }
}
