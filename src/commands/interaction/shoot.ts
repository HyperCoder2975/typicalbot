import Command from '../../lib/structures/Command';
import { TypicalGuildMessage } from '../../lib/types/typicalbot';

export default class extends Command {
    execute(message: TypicalGuildMessage) {
        const mention = message.mentions.users.first();
        const randomAddonNum = Math.random();
        let randomAddon = '';
        if (randomAddonNum <= 0.1)
            randomAddon = message.translate('interaction/shoot:POLICE');
        else if (randomAddonNum <= 0.2 && randomAddonNum > 0.1)
            randomAddon = message.translate('interaction/shoot:MISSED');
        else if (randomAddonNum <= 0.3 && randomAddonNum > 0.2)
            randomAddon = message.translate('interaction/shoot:HEADSHOT');

        if (!mention || mention.id === message.author.id)
            return message.reply(`${message.translate('interaction/shoot:SELF')} ${randomAddon}`);
        return message.reply(`${message.translate('interaction/shoot:RESPONSE', {
            user: mention.toString()
        })} ${randomAddon}`);
    }
}
