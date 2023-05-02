import 'dotenv/config';
import dataSource from '@app/data-source.js';
import program from '@app/cli.js';
import redis from '@app/redis.js';

await redis.connect();
await dataSource.initialize();

await program.parseAsync(process.argv);
