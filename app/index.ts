import 'dotenv/config';
import dataSource from '@app/data-source.js';
import program from '@app/cli.js';
import redis from '@app/redis.js';
import process from 'process';
import logger from '@app/logger.js';

await redis.connect();
await dataSource.initialize();

process.on('uncaughtException', (err, origin) => {
  logger.error(err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error(reason, 'Unhandled Rejection.');
  process.exit(1);
});

await program.parseAsync(process.argv);
