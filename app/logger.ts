import { pino, type TransportTargetOptions } from 'pino';
import { resolve } from 'node:path';

const logstashTransport = {
  target: 'pino-socket',
  level: 'debug',
  options: {
    address: process.env['LOGSTASH_HOST'],
    port: process.env['LOGSTASH_PORT'],
    mode: 'tcp',
  }
};

const dailyTransport = {
  target: resolve('dist/utils/rotating-file-transport.js'),
  level: 'debug',
  options: {
    destination: resolve('storage/logs/app.log'),
    interval: '1d',
  },
};

const prettyTransport = {
  target: 'pino-pretty',
  level: 'debug',
  options: {
    translateTime: 'HH:MM:ss Z',
    ignore: 'pid,hostname',
  },
};

const transportTargets: TransportTargetOptions[] = [prettyTransport];

if ('development' === process.env['NODE_ENV']) {
  transportTargets.push(dailyTransport);
}

if ('staging' === process.env['NODE_ENV'] || 'production' === process.env['NODE_ENV']) {
  transportTargets.push(logstashTransport);
}

const transport = {
  targets: transportTargets,
};

export default pino({
  transport,
  name: `pouch-${process.env['NODE_ENV']}`,
  level: 'debug',
});
