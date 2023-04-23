import 'dotenv/config';
import dataSource from '@app/data-source.js';
import program from '@app/cli.js';

await dataSource.initialize();

program.parse();
