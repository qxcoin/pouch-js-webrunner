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

  public override async tick(walletType: WalletTypes) {
    logger.info({ walletType }, `[${walletType}] Starting to check mempool...`);

    const startTime = performance.now();

    const wallet = w.create(walletType);

    const mempool = await wallet.getMempool();
    logger.debug({ walletType }, `[${walletType}] Mempool download done.`);

    const cacheKey = `${walletType}_mempool_transaction_hashes`;
    const cachedValue = await redis.get(cacheKey);
    const cachedTransactionHashes = null === cachedValue ? [] : JSON.parse(cachedValue);
    logger.debug({ walletType }, `[${walletType}] Mempool cache parse done.`);

    if (!mempool.transactionHashes.length) {
      logger.info({ walletType }, `[${walletType}] Mempool is empty.`);
      return;
    }

    // if the cache is empty, it is probably initial run or app was stopped for a while
    // in any case, we don't need to check the mempool, because while app was not run or was stopped
    // no payment should have been made, so we simply cache everything inside initial mempool
    // and then next time we continue checking new transactions
    let transactionHashes: string[] = [];
    if (!cachedTransactionHashes.length) {
      logger.info({ walletType }, `[${walletType}] Mempool cache is empty, we will cache all ${mempool.transactionHashes.length} transaction.`);
      transactionHashes = []; // set no transactions to check
    }
    // if the cache is not empty, we simply check the new transactions
    else {
      transactionHashes = arrayDiff(mempool.transactionHashes, cachedTransactionHashes);
      logger.info({ walletType }, `[${walletType}] Mempool has ${transactionHashes.length} transactions non-cached out of ${mempool.transactionHashes.length}.`);
    }

    const checkTransaction = async (hash: string): Promise<void> => {
      try {
        const walletTransaction = await wallet.getTransaction(hash);
        const transactions = await BlockchainService.handleTransaction(walletType, walletTransaction);
        await TransactionService.reportTransactions(transactions);
      } catch {
        // we don't want any error
      }
    };

    // let's remember the mempool so we won't need to check same mempool again
    await redis.set(cacheKey, JSON.stringify(mempool.transactionHashes), 'PX', 1 * 60 * 1000);

    const promises: Promise<void>[] = [];
    for (const hash of transactionHashes) promises.push(checkTransaction(hash));
    await Promise.all(promises);

    const totalTime = Math.floor((performance.now() - startTime) / 1000);
    logger.info({ walletType, totalTime }, `[${walletType}] Checked mempool in ${totalTime} second(s).`);
  }

}
