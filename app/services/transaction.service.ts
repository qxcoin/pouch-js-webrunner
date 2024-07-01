import { WalletTypes } from 'pouch';
import dataSource from '@app/data-source.js';
import { Transaction } from '@entities/transaction.js';
import { ReportTransactionJob } from '@app/jobs/report-transaction.job.js';
import logger from '@app/logger.js';

export class TransactionService {

  public static async get(to: string, hash: string) {
    const repo = dataSource.getRepository(Transaction);
    return await repo.findOne({ where: { to, hash } });
  }

  public static async has(to: string, hash: string) {
    const repo = dataSource.getRepository(Transaction);
    return await repo.exists({ where: { to, hash } });
  }

  public static async create(walletType: WalletTypes, walletId: string, from: string[], to: string, hash: string, data: string, currency: string, value: bigint, blockHeight?: number) {
    const repo = dataSource.getRepository(Transaction);
    const transaction = new Transaction();
    transaction.walletType = walletType;
    transaction.walletId = walletId;
    transaction.from = from;
    transaction.to = to;
    transaction.hash = hash;
    transaction.data = data;
    transaction.value = value.toString();
    transaction.currency = currency;
    transaction.blockHeight = blockHeight;
    await repo.save(transaction);
    return transaction;
  }

  public static async find(filters: Partial<{ walletType: WalletTypes, walletId: string, currency: string, to: string, hash: string }>) {
    const repo = dataSource.getRepository(Transaction);
    const transactions = await repo.findBy(filters);
    return transactions;
  }

  public static async confirm(transaction: Transaction, blockHeight: number) {
    const repo = dataSource.getRepository(Transaction);
    transaction.blockHeight = blockHeight;
    await repo.save(transaction);
  }

  public static async reportTransactions(transactions: Transaction[]) {
    for (const transaction of transactions) {
      await this.reportTransaction(transaction);
    }
  }

  /**
   * Report the transaction to the audience.
   */
  public static async reportTransaction(transaction: Transaction) {
    await (new ReportTransactionJob).dispatch({ transaction }, {
      attempts: 8,
      backoff: { type: 'exponential', delay: 4000 },
    });
  }

}
