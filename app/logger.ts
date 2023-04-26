import pino, { Logger } from 'pino';

const transport = {
  targets: [
    { target: 'pino/file', level: 'debug', options: { destination: `./storage/logs/${new Date().toISOString().slice(0, 10)}.log` } },
    { target: 'pino-pretty', level: 'debug', options: { translateTime: 'HH:MM:ss Z', ignore: 'pid,hostname' } }
  ],
};

const logger: Logger = pino({
  transport,
  level: process.env['NODE_ENV'] === 'development' ? 'debug' : 'info',
});

export default logger;
