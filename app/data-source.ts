import 'dotenv/config';
import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'mysql',
  url: process.env['DATABASE_URL'],
  logging: true,
  charset: 'utf8mb4',
  entities: ['./dist/entities/**/*.js', './app/entities/**/*.ts'],
  migrations: ['./dist/migrations/**/*.js'],
  subscribers: [],
  synchronize: false,
});
