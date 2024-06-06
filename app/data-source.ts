import 'dotenv/config';
import { DataSource } from 'typeorm';
import path from 'node:path';
import url from 'node:url';

export default new DataSource({
  type: 'mysql',
  url: process.env['DATABASE_URL'],
  logging: ['error'],
  charset: 'utf8mb4',
  entities: [path.join(path.dirname(url.fileURLToPath(import.meta.url)), '/entities/**/*.{js,ts}')],
  migrations: [path.resolve('dist/migrations/**/*.js')],
  subscribers: [],
  synchronize: false,
  cache: {
    type: 'ioredis',
    options: {
      host: process.env['REDIS_HOST'],
      port: process.env['REDIS_PORT'],
      password: process.env['REDIS_PASSWORD']
    }
  },
});
