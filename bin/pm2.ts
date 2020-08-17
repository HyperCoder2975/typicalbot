/* eslint-disable @typescript-eslint/naming-convention */
import { Util } from 'discord.js';
import pm2 from 'pm2';

async function generateClusters() {
    const shardCount = await Util.fetchRecommendedShards(process.env.TOKEN!);
    const shards = Array.from({ length: shardCount }, (_a, b) => b);
    const clusterCount = Math.ceil(shardCount / 10);
    const clusters = [];

    for (let i = 1; i <= clusterCount; i++) {
        const clusterShards = shards.splice(0, 10);

        clusters.push({
            name: `${process.env.CLUSTER_SERVER}-${
                process.env.CLUSTER_BUILD ? `${process.env.CLUSTER_BUILD}-` : ''
            }${i}`,
            script: './dist/src/index.js',
            autorestart: true,
            watch: false,
            env: {
                CLUSTER: `${process.env.CLUSTER_SERVER} ${
                    process.env.CLUSTER_BUILD ? `${process.env.CLUSTER_BUILD} ` : ''
                }${i}`,
                CLUSTER_COUNT: clusterCount.toString(),
                SHARDS: `[${clusterShards.join(',')}]`,
                SHARD_COUNT: shardCount.toString(),
                TOTAL_SHARD_COUNT: shardCount.toString()
            }
        });
    }

    return clusters;
}

pm2.connect(async (err: Error) => {
    if (err) {
        console.error(err);
        process.exit(2);
    }

    const clusters = await generateClusters();

    console.log('Generating Clusters\n', clusters);

    clusters.forEach((cluster, i) => {
        pm2.start(cluster, (e: Error) => {
            if (i === clusters.length - 1) {
                console.log('Generation Complete.\nExiting.');
                pm2.disconnect();
            }

            if (e) throw e;
        });
    });
});
