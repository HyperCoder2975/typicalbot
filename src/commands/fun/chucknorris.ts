import fetch from 'node-fetch';
import Command from '../../lib/structures/Command';
import { TypicalGuildMessage } from '../../lib/types/typicalbot';

export default class extends Command {
    aliases = ['chuck', 'norris'];

    execute(message: TypicalGuildMessage) {
        fetch('https://api.icndb.com/jokes/random')
            .then((res) => res.json())
            .then((json) => message.send(json.value.joke))
            .catch(() => message.error(message.translate('common:REQUEST_ERROR')));
    }
}
