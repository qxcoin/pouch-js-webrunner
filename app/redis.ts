import { Redis } from 'ioredis';

export default new Redis({
  host: process.env['REDIS_HOST'],
  port: parseInt(process.env['REDIS_PORT'] ?? '6379'),
  password: process.env['REDIS_PASSWORD'],
  lazyConnect: true,
  maxRetriesPerRequest: null, // this is required for BullMQ!
});
