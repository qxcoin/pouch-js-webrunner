import pino from 'pino';
import { resolve } from 'node:path';

const transport = {
  targets: [
    { target: resolve('dist/utils/rotating-file-transport.js'), level: 'debug', options: { destination: resolve('storage/logs/app.log'), interval: '1d' } },
    { target: 'pino-pretty', level: 'debug', options: { translateTime: 'HH:MM:ss Z', ignore: 'pid,hostname' } }
  ],
};

export default pino({
  transport,
  level: process.env['NODE_ENV'] === 'development' ? 'debug' : 'info',
});
