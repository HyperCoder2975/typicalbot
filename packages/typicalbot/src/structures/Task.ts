import Cluster from '../index';
import { TaskOptions } from '../types/typicalbot';

export default class Task {
    id: number;
    type: string;
    end: number;
    data: unknown;
    client: Cluster;

    constructor(client: Cluster, options: TaskOptions) {
        this.client = client;
        this.id = options.id;
        this.type = options.type;
        this.end = options.end;
        this.data = options.data;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    execute(_data?: unknown) {
        throw new Error(
            'Silly you, how did you forget to create an execute method in a task file hehehehe. Tsk Tsk Tsk!'
        );
    }
}
