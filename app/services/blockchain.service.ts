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
import { Address } from '@app/entities/address.js';

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
    const outputs: { address: Address, value: bigint }[] = [];
    for (const out of transaction.outputs) {
      const addressHash = await out.address();
      const address = await AddressService.get(addressHash);
      if (address) {
        const active = await AddressService.isActive(address.walletType, address.walletId, addressHash);
        if (active) outputs.push({ address, value: out.value });
      }
    }
    // if we have not found any output related to us, we do nothing
    if (!outputs.length) {
      return;
    }
    const inputAddressHashes: string[] = [];
    for (const inp of transaction.inputs) {
      const addressHash = await inp.address();
      inputAddressHashes.push(addressHash);
    }
    for (const out of outputs) {
      const oldTx = await TransactionService.get(out.address.hash, transaction.hash);
      if (oldTx) {
        if (blockHeight && !oldTx.blockHeight) await TransactionService.confirm(oldTx, blockHeight);
      } else {
        TransactionService.create(walletType, out.address.walletId, inputAddressHashes, out.address.hash, transaction.hash, transaction.data, walletsConfig[walletType].coin.code, out.value, blockHeight);
      }
    }
  }

  private static async handleTokenTransaction(walletType: WalletTypes, transaction: TokenTransaction, blockHeight?: number) {
    // if the transaction is not sending money to us, we have nothing to do with it
    const address = await AddressService.get(transaction.from);
    if (!address) return;
    const active = await AddressService.isActive(address.walletType, address.walletId, transaction.from);
    if (!active) return;
    // if transaction already exists, don't insert it again, and if possible confirm it
    const oldTx = await TransactionService.get(transaction.to, transaction.hash);
    if (oldTx) {
      if (blockHeight && !oldTx.blockHeight) await TransactionService.confirm(oldTx, blockHeight);
      return;
    }
    // if we don't have any token associated to the contract address, do nothing
    const currency = walletsConfig[walletType].tokens.find(c => c.contractAddress === transaction.contractAddress);
    if (undefined === currency) {
      return;
    }
    TransactionService.create(walletType, address.walletId, [transaction.from], transaction.to, transaction.hash, transaction.data, currency.code, transaction.value, blockHeight);
  }

  public static transfer(walletType: WalletTypes, currency: string, from: string, to: string, amount: bigint): Promise<string> {
    const conf = walletsConfig[walletType];
    if (conf['coin'].code === currency)
      return BlockchainService.transferCoin(walletType, from, to, amount);
    else if (conf['tokens'].find(c => c.code === currency))
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
    const transactions = await TransactionService.satisfy(walletType, walletId, currency.code, from, amount);
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
    const currency = walletsConfig[walletType].tokens.find(c => c.code === tokenCode);
    if (undefined === currency) {
      throw new Error(`Token [${tokenCode}] is not supported in ${walletType} wallet.`);
    }
    const contractAddress = currency.contractAddress;
    const transactions = await TransactionService.satisfy(walletType, walletId, tokenCode, from, amount);
    const wallet = w.create(walletType);
    const fromPouchAddr = await wallet.getAddress(fromAddr.index, fromAddr.accountIndex);
    const transaction = await wallet.createTokenTransaction(contractAddress, fromPouchAddr, to, amount);
    await wallet.broadcastTransaction(transaction);
    await TransactionService.spend(transactions);
    return transaction.hash;
  }
}
