import 'dotenv/config';
import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'mysql',
  url: process.env['DATABASE_URL'],
  logging: true,
  charset: 'utf8mb4',
  entities: [process.env['NODE_ENV'] === 'production' ? './dist/entities/**/*.js' : './app/entities/**/*.ts'],
  migrations: ['./dist/migrations/**/*.js'],
  subscribers: [],
  synchronize: false,
  cache: {
    type: 'redis',
    options: {
      socket: { host: process.env['REDIS_HOST'], port: process.env['REDIS_PORT'], },
      password: 'secret'
    }
  },
});
