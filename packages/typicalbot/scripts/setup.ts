/* eslint-disable no-console */
import { r } from 'rethinkdb-ts';
import * as configs from '../config.json';

const { credentials } = configs.database;

(async () => {
    await r.connectPool(credentials);
    await r.branch(r.dbList().contains(credentials.db), null, r.dbCreate(credentials.db)).run();

    const db = r.db(credentials.db);
    const dbTables = db.tableList();

    const tables = ['guilds', 'mutes', 'tasks', 'donors'];

    tables.forEach(
        (table) => r.branch(
            dbTables.contains(table),
            null,
            db.tableCreate(table),
        ).run(),
    );

    console.log('The database should be good to go.');
    process.exit();
})();
