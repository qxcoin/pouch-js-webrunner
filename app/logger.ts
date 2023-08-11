import pino from 'pino';
import path from 'path';

const transport = {
  targets: [
    { target: path.resolve('dist/utils/rotating-file-transport.js'), level: 'debug', options: { destination: './storage/logs/app.log', interval: '1d' } },
    { target: 'pino-pretty', level: 'debug', options: { translateTime: 'HH:MM:ss Z', ignore: 'pid,hostname' } }
  ],
};

export default pino({
  transport,
  level: process.env['NODE_ENV'] === 'development' ? 'debug' : 'info',
});
