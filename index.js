require('dotenv').config();

if (process.env.USE_CLUSTER === 'true') process.env.USE_CLUSTER = true;
else process.env.USE_CLUSTER = false;

const { Node } = require('veza');
const Cluster = require('./src');

if (/^\s*(true|1|on|yes)\s*$/.test(process.env.USE_CLUSTER)) {
    const node = new Node(process.env.CLUSTER)
        .on('error', (error, client) => console.error(`[IPC] Error from ${client.name}:`, error))
        .on('socket.disconnect', (client) => console.error(`[IPC] Disconnected from ${client.name}`))
        .on('socket.destroy', (client) => console.error(`[IPC] Client Destroyed: ${client.name}`))
        .on('socket.ready', async (client) => {
            console.log(`[IPC] Connected to: ${client.name}`);
        });

    node.connectTo(process.env.NODE).catch((error) => console.error('[IPC] Disconnected!', error));

    const client = new Cluster(node);

    node.on('message', async (message) => {
        if (message.data.event === 'collectData') {
            message.reply(eval(`client.${message.data.data}`));
        } else if (message.data.event === 'shardCount') {
            message.reply(client.shardCount);
        } else if (message.data.event === 'channelEmbed') {
            const { apiKey, channel, json } = message.data;

            const guild = Buffer.from(apiKey.split('.')[0], 'base64').toString('utf-8');

            if (!client.guilds.has(guild)) return message.reply({ response: "Guild doesn't exist." });

            const settings = await client.settings.fetch(guild);
            const trueApiKey = settings.apikey;

            if (apiKey !== trueApiKey) return message.reply({ response: 'Invalid API key.' });

            const trueGuild = client.guilds.get(guild);

            if (!trueGuild.channels.has(channel)) return message.reply({ response: "Channel doesn't exist." });

            const trueChannel = trueGuild.channels.get(channel);

            trueChannel.send('', json).then(() => message.reply({ response: 'Success' })).catch((err) => message.reply({ response: 'An error occured.' }));
        }
    });
} else new Cluster();
