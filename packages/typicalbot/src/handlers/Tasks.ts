import { Collection } from 'discord.js';
import { join, parse } from 'path';
import * as klaw from 'klaw';
import Cluster from '../index';
import { TaskOptions } from '../types/typicalbot';
import Task from '../structures/Task';

export default class TaskHandler {
    client: Cluster;

    collection: Collection<number, Task> = new Collection();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    taskTypes: Collection<string, any> = new Collection();

    constructor(client: Cluster) {
        this.client = client;

        const path = join(__dirname, '..', 'tasks');
        const start = Date.now();

        klaw(path)
            .on('data', item => {
                const file = parse(item.path);

                if (!file.ext || file.ext !== '.js') return;

                const req = (r => r.default || r)(
                    // eslint-disable-next-line @typescript-eslint/no-var-requires
                    require(join(file.dir, file.base))
                );

                this.taskTypes.set(file.name, req);
            })
            .on('end', async () => {
                // eslint-disable-next-line no-console
                console.log(
                    `Loaded ${this.collection.size} Tasks in ${Date.now() -
                        start}ms`
                );

                const list: TaskOptions[] = await this.client.handlers.database.get(
                    'tasks'
                );
                for (const task of list) {
                    const taskType = this.taskTypes.get(task.type);
                    if (!taskType) continue;

                    this.collection.set(
                        task.id,
                        new taskType(this.client, task)
                    );
                }
            });

        setInterval(() => {
            this.collection
                .filter(task => Date.now() >= task.end)
                .forEach(async task => {
                    task.execute(task.data);
                    this.collection.delete(task.id);
                });
        }, 1000);
    }

    async taskInit() {
        const tasks: TaskOptions[] = await this.client.handlers.database.get(
            'tasks'
        );

        for (const task of tasks) {
            const taskType = this.taskTypes.get(task.type);
            if (!taskType) continue;

            this.collection.set(task.id, new taskType(this.client, task));
        }
    }

    async create(type: string, end: number, data: unknown) {
        const id = 10e4 + Math.floor(Math.random() * (10e4 - 1));
        const payload = {
            id,
            type,
            end,
            data
        };

        await this.client.handlers.database.insert('tasks', payload);

        const Task = this.taskTypes.get(type);
        if (!type) return null;

        this.collection.set(id, new Task(this.client, payload));

        return Task;
    }

    async delete(id: number) {
        await this.client.handlers.database.delete('tasks', id.toString());
        this.collection.delete(id);
    }
}
