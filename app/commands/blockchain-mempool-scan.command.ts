import { Command } from "commander";
import { WalletTypes } from "pouch";
import w from "@app/wallet.js";
import logger from "@app/logger.js";
import redis from "@app/redis.js";
import { DaemonCommand } from "./daemon.command.js";
import { BlockchainService } from "@app/services/blockchain.service.js";

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
    const startTime = performance.now();

    const wallet = w.create(walletType);

    const mempool = await wallet.getMempool();
    const cacheKey = `${walletType}_mempool_transaction_hashes`;
    const cachedValue = await redis.get(cacheKey);
    const cachedTransactionHashes = null === cachedValue ? [] : JSON.parse(cachedValue);

    logger.info(`[${walletType}] Starting to check mempool...`);

    if (!mempool.transactionHashes.length) {
      logger.info(`[${walletType}] Mempool is empty.`);
      return;
    }

    let transactionHashes: string[] = [];
    if (!cachedTransactionHashes.length) {
      logger.info(`[${walletType}] Mempool cache is empty, we will check everything.`);
      transactionHashes = mempool.transactionHashes;
    } else {
      transactionHashes = mempool.transactionHashes.filter(h => !cachedTransactionHashes?.includes(h));
      logger.info(`[${walletType}] Mempool has ${transactionHashes.length} transactions non-cached out of ${mempool.transactionHashes.length}, we will check them.`);
    }

    for (const hash of transactionHashes) {
      let transaction;
      try { transaction = await wallet.getTransaction(hash) } catch { continue }
      await BlockchainService.handleTransaction(walletType, transaction);
    }

    // let's remember the mempool so we won't need to check same mempool again
    await redis.set(cacheKey, JSON.stringify(mempool.transactionHashes), { PX: (this.delay * 10) });

    const totalTime = Math.floor((performance.now() - startTime) / 1000);
    logger.info(`[${walletType}] Checked mempool in ${totalTime} second(s).`);
  }

}
