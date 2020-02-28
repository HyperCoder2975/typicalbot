import './extensions/TypicalGuild';
import './extensions/TypicalGuildMember';
import './extensions/TypicalMessage';

import { Client, Collection } from 'discord.js';
import fetch from 'node-fetch';
import { Client as VezaClient } from 'veza';
import config from '../config.json';

import DatabaseHandler from './handlers/Database';
import TaskHandler from './handlers/Tasks';
import PermissionsHandler from './handlers/Permissions';
import ModerationLogHandler from './handlers/ModerationLog';
import SettingsHandler from './handlers/Settings';
import FunctionHandler from './handlers/Functions';
import CommandHandler from './handlers/Commands';
import EventHandler from './handlers/Events';

import {
    TypicalDonor,
    HelperFunctions,
    BanLog,
    UnbanLog
} from './types/typicalbot';
import i18n from './i18n';
import { TFunction } from 'i18next';

import * as Sentry from '@sentry/node';

interface TypicalHandlers {
    database: DatabaseHandler;
    tasks: TaskHandler;
    permissions: PermissionsHandler;
    moderationLog: ModerationLogHandler;
}
export default class Cluster extends Client {
    node: VezaClient | undefined;
    config = config;
    build = config.build;
    shards: number[] = JSON.parse(process.env.SHARDS || '[1]');
    shardCount = process.env.TOTAL_SHARD_COUNT || '1';
    cluster = `${process.env.CLUSTER} [${this.shards.join(',')}]`;
    handlers = {} as TypicalHandlers;
    settings = new SettingsHandler(this);
    functions = new FunctionHandler(this);
    helpers = {} as HelperFunctions;
    commands = new CommandHandler(this);
    events = new EventHandler(this);
    caches = {
        donors: new Collection<string, TypicalDonor>(),
        bans: new Collection<string, BanLog>(),
        unbans: new Collection<string, UnbanLog>(),
        softbans: new Collection(),
        invites: new Collection<string, Collection<string, NodeJS.Timeout>>()
    };
    translate: Map<string, TFunction> = new Map();
    constructor(node: VezaClient | undefined) {
        super({
            messageCacheMaxSize: 150,
            messageCacheLifetime: 1800,
            messageSweepInterval: 300,
            disableMentions: false,
            disabledEvents: ['TYPING_START', 'CHANNEL_PINS_UPDATE'],
            partials: ['MESSAGE']
        });

        Sentry.init({
            dsn: this.config.apis.sentry
        });

        this.node = node;

        this.login(this.config.token);
    }

    async login(token: string) {
        // MUST SETUP DATABASE BEFORE ANYTHING ELSE
        this.handlers.database = new DatabaseHandler(this);
        await this.handlers.database.init();

        this.handlers.tasks = new TaskHandler(this);
        this.handlers.permissions = new PermissionsHandler(this);
        this.handlers.moderationLog = new ModerationLogHandler(this);

        // Fetch donors
        this.fetchDonors();
        // Setup translation i18n before login to client
        this.translate = await i18n();
        console.log('Loaded i18n Languages');

        return super.login(token);
    }

    fetchData(property: string) {
        if (!this.node) return eval(`this.${property}`);

        return this.node.sendTo(
            'manager',
            {
                event: 'collectData',
                data: property
            },
            { receptive: true }
        );
    }

    async fetchDonors() {
        const donors = await this.handlers.database.get('donors');

        donors.forEach((donor: TypicalDonor) => {
            if (donor.id.length > 5) this.caches.donors.set(donor.id, donor);
        });
    }

    get usedRAM() {
        return Math.round(process.memoryUsage().heapUsed / 1048576);
    }

    get totalRAM() {
        return Math.round(process.memoryUsage().heapTotal / 1048576);
    }

    async sendStatistics(shardID: number) {
        fetch('https://www.carbonitex.net/discord/data/botdata.php', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                shardid: shardID,
                shardcount: this.shardCount.toString(),
                servercount: this.guilds.cache
                    .filter(g => g.shardID === shardID)
                    .size.toString(),
                key: this.config.apis.carbonkey
            })
        }).catch(err => {
            Sentry.captureException(err);
        });

        fetch(
            `https://discordbots.org/api/bots/${this.user &&
                this.user.id}/stats`,
            {
                method: 'post',
                headers: {
                    Authorization: this.config.apis.discordbots
                },
                body: JSON.stringify({
                    // eslint-disable-next-line @typescript-eslint/camelcase
                    shard_id: shardID,
                    // eslint-disable-next-line @typescript-eslint/camelcase
                    shard_count: this.shardCount.toString(),
                    // eslint-disable-next-line @typescript-eslint/camelcase
                    server_count: this.guilds.cache
                        .filter(g => g.shardID === shardID)
                        .size.toString()
                })
            }
        ).catch(err => {
            Sentry.captureException(err);
        });
    }
}
