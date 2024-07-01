import { Command } from "commander";
import { WalletTypes } from "pouch";
import w from "@app/wallet.js";
import logger from "@app/logger.js";
import { wallets as walletsConfig } from "@app/config.js";
import { DaemonCommand } from "./daemon.command.js";
import { BlockchainService } from "@app/services/blockchain.service.js";
import { TransactionService } from "@app/services/transaction.service.js";

export class BlockchainSyncCommand extends DaemonCommand {

  public build(): Command {
    const program = new Command();
    program.name('blockchain:sync');
    program.argument('<wallet type>');
    program.action(this.run.bind(this));
    return program;
  }

  public override async run(walletType: WalletTypes, options: { from?: string, to?: string }) {
    if (options.from) {
      await this.manualMode(walletType);
    } else {
      await this.autoMode(walletType);
    }
  }

  public async manualMode(walletType: WalletTypes) {
    const startTime = performance.now();

    const wallet = w.create(walletType);
    if (!w.isSyncWallet(wallet)) throw new Error(`Wallet [${walletType}] is not a sync wallet.`);

    const from = await wallet.getSyncedBlockHeight();
    const to = await wallet.getLastBlockHeight();

    console.log(`Syncing block(s) ${from}-${to}...`);

    await BlockchainService.syncBlocks(walletType, {
      onTransaction: () => {},
      onProgress: (blockHeight) => {
        console.log(`'Synced block ${blockHeight}.'`);
      }
    });

    const totalTime = Math.floor((performance.now() - startTime) / 1000);
    console.log(`Checked block(s) ${from}-${to} in ${totalTime} seconds.`);

    process.exit(0);
  }

  public async autoMode(walletType: WalletTypes) {
    this.delay = walletsConfig[walletType].blockTime;
    await super.run(walletType);
  }

  private logger(walletType: WalletTypes) {
    return logger.child({ command: BlockchainSyncCommand.name, walletType });
  }

  public override async tick(walletType: WalletTypes) {
    this.logger(walletType).info('Starting to sync blocks...');

    const startTime = performance.now();

    const wallet = w.create(walletType);
    if (!w.isSyncWallet(wallet)) throw new Error(`Wallet [${walletType}] is not a sync wallet.`);

    const from = await wallet.getSyncedBlockHeight();
    const to = await wallet.getLastBlockHeight();

    this.logger(walletType).info({ from, to }, 'Syncing block(s)...');

    const transactions = await BlockchainService.syncBlocks(walletType, {
      onTransaction: () => {},
      onProgress: (blockHeight) => {
        this.logger(walletType).info({ height: blockHeight }, 'Synced block.');
      }
    });

    // if we found any transactions, we need to report them to audience
    await TransactionService.reportTransactions(transactions);

    const totalTime = Math.floor((performance.now() - startTime) / 1000);
    this.logger(walletType).info({ totalTime, from, to }, 'Synced block(s).');
  }

}
