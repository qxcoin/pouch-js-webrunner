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

  public static async find(filters: Partial<{ walletType: WalletTypes, walletId: string, currency: string, to: string, hash: string, spent: boolean }>) {
    const repo = dataSource.getRepository(Transaction);
    const transactions = await repo.findBy(filters);
    return transactions;
  }

  /**
   * Find spendable transactions to satisfy the amount provided.
   */
  public static async satisfy(walletType: WalletTypes, walletId: string, currency: string, addressHash: string, amount: bigint) {
    const transactions = await this.find({ walletType, walletId, currency, to: addressHash, spent: false });
    // let's sort transactions from the ones that have smallest value to bigger values
    // so we first spend smaller transactions
    // this will help us to have fewer inputs and smaller TX size next time
    transactions.sort((a, b) => {
      return a < b ? -1 : (a > b ? 1 : 0);
    });
    // now let's pick transactions as much as we need to satisfy the amount
    const picked: Transaction[] = [];
    let sum = 0n;
    for (const t of transactions) {
      picked.push(t);
      sum += BigInt(t.value);
      if (sum >= amount) break;
    }
    // if sum of transactions value is not bigger or equal than the amount we need
    // we don't have enough balance so we throw an error
    if (sum < amount) {
      throw new Error('Not enough balance.');
    } else {
      return picked;
    }
  }

  public static async confirm(transaction: Transaction, blockHeight: number) {
    const repo = dataSource.getRepository(Transaction);
    transaction.blockHeight = blockHeight;
    await repo.save(transaction);
  }

  public static async spend(transactions: Transaction | Transaction[]) {
    if (transactions instanceof Transaction) transactions = [transactions];
    const repo = dataSource.getRepository(Transaction);
    transactions.forEach((t) => {
      t.spent = true;
      repo.save(t);
    });
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
