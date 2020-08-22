import Command from '../../lib/structures/Command';
import { TypicalGuildMessage } from '../../lib/types/typicalbot';
import { MODE, PERMISSION_LEVEL } from '../../lib/utils/constants';
import { MessageEmbed } from 'discord.js';
import v8 from 'v8';

const formatSize = (size: number) => {
    const kb = size / 1024;
    const mb = kb / 1024;
    const gb = mb / 1024;

    if (kb < 1024) {
        return `${kb.toFixed(0)}KB`;
    } else if (kb > 1024 && mb < 1024) {
        return `${mb.toFixed(0)}MB`;
    }


    return `${gb.toFixed(2)}GB`;
};

export default class extends Command {
    permission = PERMISSION_LEVEL.BOT_OWNER;
    mode = MODE.STRICT;

    async execute(message: TypicalGuildMessage) {
        const heap = v8.getHeapStatistics();
        const heapContent = [
            `Allocated Memory : ${formatSize(heap.malloced_memory)}`,
            `Heap Size Limit  : ${formatSize(heap.heap_size_limit)}`,
            `Used Heap Size   : ${formatSize(heap.used_heap_size)}/${formatSize(heap.total_heap_size)}`,
            `Physical Size    : ${formatSize(heap.total_physical_size)}`
        ];

        if (!message.embeddable)
            return message.send([
                '**Heap Statistics**',
                '```swift',
                ...heapContent,
                '```'
            ].join('\n'));

        message.send(new MessageEmbed()
            .setTitle('Heap Statistics')
            .setDescription([
                '```swift',
                ...heapContent,
                '```'
            ].join('\n')));
    }
}
