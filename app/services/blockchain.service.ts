import {
  RawTransaction,
  CoinTransaction,
  TokenTransaction,
  WalletTypes,
} from 'pouch';
import { AddressService } from './address.service.js';
import { TransactionService } from './transaction.service.js';
import w, { walletId } from '@app/wallet.js';
import { wallets as walletsConfig } from '@app/config.js';

export class BlockchainService {

  public static async checkBlocks(walletType: WalletTypes, from: number, to: number): Promise<void> {
    const wallet = w.create(walletType);
    const blocks = await wallet.getBlocks(from, to);
    for (const block of blocks) {
      for (const transaction of block.transactions) {
        await this.handleTransaction(walletType, transaction, block.height);
      }
    }
  }

  public static async handleTransaction(walletType: WalletTypes, transaction: CoinTransaction | TokenTransaction, blockHeight?: number) {
    if (transaction instanceof TokenTransaction)
      return this.handleTokenTransaction(walletType, transaction, blockHeight);
    else if (transaction instanceof CoinTransaction)
      return this.handleCoinTransaction(walletType, transaction, blockHeight);
  }

  private static async handleCoinTransaction(walletType: WalletTypes, transaction: CoinTransaction, blockHeight?: number) {
    const outputs: { address: string, value: bigint }[] = [];
    for (const out of transaction.outputs) {
      const address = await out.address();
      if (await AddressService.hasActive(walletType, walletId, address)) {
        outputs.push({ address, value: out.value });
      }
    }
    // if we have not found any output related to us, we do nothing
    if (!outputs.length) {
      return;
    }
    const inputAddresses: string[] = [];
    for (const inp of transaction.inputs) {
      const address = await inp.address();
      inputAddresses.push(address);
    }
    for (const out of outputs) {
      const oldTx = await TransactionService.find(out.address, transaction.hash);
      if (oldTx) {
        if (blockHeight && !oldTx.blockHeight)
          await TransactionService.confirm(oldTx, blockHeight);
        continue;
      }
      const currency = walletsConfig[walletType].coin;
      TransactionService.create(walletType, walletId, inputAddresses, out.address, transaction.hash, transaction.data, currency, out.value, blockHeight);
    }
  }

  private static async handleTokenTransaction(walletType: WalletTypes, transaction: TokenTransaction, blockHeight?: number) {
    // if the transaction is not sending money to us, we have nothing to do with it
    if (!(await AddressService.hasActive(walletType, walletId, transaction.from))) return;
    // if transaction already exists, don't insert it again, and if possible confirm it
    const oldTx = await TransactionService.find(transaction.to, transaction.hash);
    if (oldTx) {
      if (blockHeight && !oldTx.blockHeight)
        await TransactionService.confirm(oldTx, blockHeight);
      return;
    }
    // if we don't have any token associated to the contract address, do nothing
    const currency = Object.keys(walletsConfig[walletType].tokens).find(key => walletsConfig[walletType].tokens[key] === transaction.contractAddress);
    if (undefined === currency) {
      return;
    }
    TransactionService.create(walletType, walletId, [transaction.from], transaction.to, transaction.hash, transaction.data, currency, transaction.value, blockHeight);
  }

  public static transfer(walletType: WalletTypes, currency: string, from: string, to: string, amount: bigint): Promise<string> {
    const conf = walletsConfig[walletType];
    if (conf['coin'] === currency)
      return BlockchainService.transferCoin(walletType, from, to, amount);
    else if (undefined !== conf['tokens'][currency])
      return BlockchainService.transferToken(walletType, currency, from, to, amount);
    else
      throw new Error(`Currency [${currency}] is not supported in ${walletType} wallet.`);
  }

  public static async transferCoin(walletType: WalletTypes, from: string, to: string, amount: bigint): Promise<string> {
    const fromAddr = await AddressService.get(from);
    if (null === fromAddr) {
      throw new Error(`Address [${from}] does not exist in wallet.`);
    }
    if (walletType !== fromAddr.walletType || walletId !== fromAddr.walletId) {
      throw new Error(`Address [${from}] is not part of current wallet.`);
    }
    const currency = walletsConfig[walletType].coin;
    const transactions = await TransactionService.satisfy(walletType, walletId, currency, from, amount);
    const wallet = w.create(walletType);
    const fromPouchAddr = await wallet.getAddress(fromAddr.index, fromAddr.accountIndex);
    const spending = transactions.map((t) => new RawTransaction(t.hash, t.data));
    const transaction = await wallet.createTransaction(fromPouchAddr, to, amount, spending);
    await wallet.broadcastTransaction(transaction);
    await TransactionService.spend(transactions);
    return transaction.hash;
  }

  public static async transferToken(walletType: WalletTypes, tokenCode: string, from: string, to: string, amount: bigint): Promise<string> {
    const fromAddr = await AddressService.get(from);
    if (null === fromAddr) {
      throw new Error(`Address [${from}] does not exist in wallet.`);
    }
    if (walletType !== fromAddr.walletType || walletId !== fromAddr.walletId) {
      throw new Error(`Address [${from}] is not part of current wallet.`);
    }
    const contractAddress = walletsConfig[walletType].tokens[tokenCode];
    if (undefined === contractAddress) {
      throw new Error(`Token [${tokenCode}] does not have a contract address.`);
    }
    const transactions = await TransactionService.satisfy(walletType, walletId, tokenCode, from, amount);
    const wallet = w.create(walletType);
    const fromPouchAddr = await wallet.getAddress(fromAddr.index, fromAddr.accountIndex);
    const transaction = await wallet.createTokenTransaction(contractAddress, fromPouchAddr, to, amount);
    await wallet.broadcastTransaction(transaction);
    await TransactionService.spend(transactions);
    return transaction.hash;
  }
}
