import logger from "@app/logger.js";
import { Transaction } from '@entities/transaction.js';
import { Job as BullmqJob } from 'bullmq';
import { Job } from './job.js';

export interface DataType {
  transaction: Transaction,
}

export class ReportTransactionJob extends Job<DataType> {

  override async execute(job: BullmqJob<DataType>) {
    const transaction = job.data.transaction;
    const endpoint = process.env['AUDIENCE_ENDPOINT']!;
    const secret = process.env['AUDIENCE_SECRET']!;
    const credentials = Buffer.from(secret).toString('base64');
    logger.info({ endpoint, secret, transaction }, 'Reporting transaction...');
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Basic ${credentials}`,
    };
    const body = JSON.stringify(transaction);
    const res = await fetch(endpoint, { method: 'POST', headers, body });
    // if we didn't receive a successful response from the audience
    // we should fail the job so it will retry
    if (!res.ok) {
      throw new Error('Failed to get a successful response from the audience.');
    }
  }
}
