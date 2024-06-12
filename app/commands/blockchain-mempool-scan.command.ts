import { Command } from "commander";
import { WalletTypes } from "pouch";
import w from "@app/wallet.js";
import logger from "@app/logger.js";
import redis from "@app/redis.js";
import { DaemonCommand } from "./daemon.command.js";
import { arrayDiff } from "@utils/helpers.js";
import { BlockchainService } from "@app/services/blockchain.service.js";
import { TransactionService } from "@app/services/transaction.service.js";

export class BlockchainMempoolScanCommand extends DaemonCommand {

  public override delay: number = 16 * 1000;

  public build(): Command {
    const program = new Command();
    program.name('blockchain:mempool:scan');
    program.argument('<wallet>');
    program.action(this.run.bind(this));
    return program;
  }

  private logger(walletType: WalletTypes) {
    return logger.child({ command: BlockchainMempoolScanCommand.name, walletType });
  }

  public override async tick(walletType: WalletTypes) {
    this.logger(walletType).info('Starting to check mempool...');

    const startTime = performance.now();

    const wallet = w.create(walletType);

    const mempool = await wallet.getMempool();
    this.logger(walletType).debug('Mempool download done.');

    const cacheKey = `${walletType}_mempool_transaction_hashes`;
    const cachedValue = await redis.get(cacheKey);
    const cachedTransactionHashes = null === cachedValue ? [] : JSON.parse(cachedValue);
    this.logger(walletType).debug('Mempool cache parse done.');

    if (!mempool.transactionHashes.length) {
      this.logger(walletType).info('Mempool is empty.');
      return;
    }

    // if the cache is empty, it is probably initial run or app was stopped for a while
    // in any case, we don't need to check the mempool, because while app was not run or was stopped
    // no payment should have been made, so we simply cache everything inside initial mempool
    // and then next time we continue checking new transactions
    let transactionHashes: string[] = [];
    if (!cachedTransactionHashes.length) {
      this.logger(walletType).info({ nonCached: mempool.transactionHashes.length }, 'Mempool cache is empty, we will cache all transactions, and check nothing.');
      transactionHashes = []; // set no transactions to check
    }
    // if the cache is not empty, we simply check the new transactions
    else {
      transactionHashes = arrayDiff(mempool.transactionHashes, cachedTransactionHashes);
      this.logger(walletType).info({ nonCached: transactionHashes.length, total: mempool.transactionHashes.length }, 'Mempool has some transactions non-cached we will check them.');
    }

    const checkTransaction = async (hash: string): Promise<void> => {
      try {
        const walletTransaction = await wallet.getTransaction(hash);
        const transactions = await BlockchainService.handleTransaction(walletType, walletTransaction);
        await TransactionService.reportTransactions(transactions);
      } catch {
        // we don't want any error
        // there may be some transactions not supported by us inside blockchain
        // in case of any error, we should ignore it and proceed to other transactions
      }
    };

    // let's remember the mempool so we won't need to check same mempool all over again
    await redis.set(cacheKey, JSON.stringify(mempool.transactionHashes), 'PX', 1 * 60 * 1000);

    const promises: Promise<void>[] = [];
    for (const hash of transactionHashes) promises.push(checkTransaction(hash));
    await Promise.all(promises);

    const totalTime = Math.floor((performance.now() - startTime) / 1000);
    this.logger(walletType).info({ walletType, totalTime }, `Checked mempool.`);
  }

}
