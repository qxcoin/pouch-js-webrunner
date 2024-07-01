import { Command } from "commander";
import { WalletTypes } from "pouch";
import w from "@app/wallet.js";
import logger from "@app/logger.js";
import redis from "@app/redis.js";
import { wallets as walletsConfig } from "@app/config.js";
import { DaemonCommand } from "./daemon.command.js";
import { BlockchainService } from "@app/services/blockchain.service.js";
import { TransactionService } from "@app/services/transaction.service.js";

export class BlockchainScanCommand extends DaemonCommand {

  public build(): Command {
    const program = new Command();
    program.name('blockchain:scan');
    program.argument('<wallet type>');
    program.option('--from <block height>');
    program.option('--to <block height>');
    program.action(this.run.bind(this));
    return program;
  }

  public override async run(walletType: WalletTypes, options: { from?: string, to?: string }) {
    if (options.from) {
      await this.manualMode(walletType, parseInt(options.from), options.to ? parseInt(options.to) : undefined);
    } else {
      await this.autoMode(walletType);
    }
  }

  public async manualMode(walletType: WalletTypes, from: number, to: number | undefined) {
    const startTime = performance.now();

    const wallet = w.create(walletType);
    if (!w.isScanWallet(wallet)) throw new Error(`Wallet [${walletType}] is not a scan wallet.`);

    to ??= await wallet.getLastBlockHeight();

    console.log(`Checking block(s) ${from}-${to}...`);

    await BlockchainService.checkBlocks(walletType, from, to);

    const totalTime = Math.floor((performance.now() - startTime) / 1000);
    console.log(`Checked block(s) ${from}-${to} in ${totalTime} seconds.`);

    process.exit(0);
  }

  public async autoMode(walletType: WalletTypes) {
    // if the actual block time is below 16 seconds, we increase it to 16 seconds for resource efficiency
    this.delay = Math.max(walletsConfig[walletType].blockTime, 16 * 1000);
    await super.run(walletType);
  }

  private logger(walletType: WalletTypes) {
    return logger.child({ command: BlockchainScanCommand.name, walletType });
  }

  public override async tick(walletType: WalletTypes) {
    this.logger(walletType).info('Starting to check blocks...');

    const startTime = performance.now();

    const wallet = w.create(walletType);
    if (!w.isScanWallet(wallet)) throw new Error(`Wallet [${walletType}] is not a scan wallet.`);

    const currentHeight = await wallet.getLastBlockHeight();
    this.logger(walletType).info({ currentHeight }, 'Current blockchain height.');

    const cacheKey = `${walletType}_block_height`;
    const cachedValue = await redis.get(cacheKey);
    const cachedHeight = null === cachedValue ? null : parseInt(cachedValue);
    this.logger(walletType).info({ cachedHeight }, 'Current cached height.');

    // a fresh start from the pick
    let range: [number, number];
    if (null === cachedHeight) {
      range = [currentHeight, currentHeight];
    }
    // we already checked this block
    else if (currentHeight <= cachedHeight) {
      this.logger(walletType).info({ currentHeight, cachedHeight }, 'Block(s) are already checked.');
      return;
    }
    // continue from where we left
    else {
      range = [(cachedHeight + 1), currentHeight];
    }

    this.logger(walletType).info({ from: range[0], to: range[1] }, 'Checking block(s)...');

    const transactions = await BlockchainService.checkBlocks(walletType, range[0], range[1]);

    // if we found any transactions, we need to report them to audience
    await TransactionService.reportTransactions(transactions);

    // at the end, we should cache the height
    // NOTE: we try to read cache value again to make sure it is not manually changed by admin
    //       if it is changed, we shouldn't overwrite it
    if (cachedValue === (await redis.get(cacheKey))) {
      await redis.set(cacheKey, range[1], 'PX', 60 * 60 * 1000);
    }

    const totalTime = Math.floor((performance.now() - startTime) / 1000);
    this.logger(walletType).info({ totalTime, from: range[0], to: range[1] }, 'Checked block(s).');
  }

}
