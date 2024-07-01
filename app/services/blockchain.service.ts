import {
  CoinTransaction,
  TokenTransaction,
  WalletTypes,
  SyncWalletListener,
} from 'pouch';
import { AddressService } from './address.service.js';
import { TransactionService } from './transaction.service.js';
import w, { walletId } from '@app/wallet.js';
import { wallets as walletsConfig } from '@app/config.js';
import { Address } from '@app/entities/address.js';
import { Transaction } from '@app/entities/transaction.js';

export class BlockchainService {

  public static async checkBlocks(walletType: WalletTypes, from: number, to: number): Promise<Transaction[]> {
    const wallet = w.create(walletType);
    if (!w.isScanWallet(wallet)) throw new Error(`Wallet [${walletType}] is not a scan wallet.`);
    const blocks = await wallet.getBlocks(from, to);
    const transactions: Transaction[] = [];
    for (const block of blocks) {
      for (const walletTransaction of block.transactions) {
        transactions.push(...await this.handleTransaction(walletType, walletTransaction, block.height));
      }
    }
    return transactions;
  }

  public static async syncBlocks(walletType: WalletTypes, listener?: SyncWalletListener): Promise<Transaction[]> {
    const wallet = w.create(walletType);
    if (!w.isSyncWallet(wallet)) throw new Error(`Wallet [${walletType}] is not a sync wallet.`);
    const transactions: Transaction[] = [];
    await wallet.sync({
      onProgress: listener?.onProgress,
      onTransaction: async (walletTransaction, blockHeight) => {
        transactions.push(...await this.handleTransaction(walletType, walletTransaction, blockHeight));
        listener?.onTransaction(walletTransaction, blockHeight);
      }
    });
    return transactions;
  }

  public static async handleTransaction(walletType: WalletTypes, walletTransaction: CoinTransaction | TokenTransaction, blockHeight?: number): Promise<Transaction[]> {
    if (walletTransaction instanceof TokenTransaction) {
      const tx = await this.handleTokenTransaction(walletType, walletTransaction, blockHeight);
      if (tx) return [tx];
      else return [];
    } else if (walletTransaction instanceof CoinTransaction) {
      return await this.handleCoinTransaction(walletType, walletTransaction, blockHeight);
    } else {
      return [];
    }
  }

  private static async handleCoinTransaction(walletType: WalletTypes, walletTransaction: CoinTransaction, blockHeight?: number): Promise<Transaction[]> {
    const outputs: { address: Address, value: bigint }[] = [];
    for (const out of walletTransaction.outputs) {
      const addressHash = await out.address();
      const address = await AddressService.get(addressHash);
      if (address) {
        const active = await AddressService.isActive(address.walletType, address.walletId, addressHash);
        if (active) outputs.push({ address, value: out.value });
      }
    }
    // if we have not found any output related to us, we do nothing
    if (!outputs.length) {
      return [];
    }
    const inputAddressHashes: string[] = [];
    for (const inp of walletTransaction.inputs) {
      const addressHash = await inp.address();
      inputAddressHashes.push(addressHash);
    }
    const transactions: Transaction[] = [];
    for (const out of outputs) {
      // if we already have transaction in database, we don't need to insert it again
      // we just check if the block height exists this time (which means transaction is not from mempool)
      // then we just confirm the transaction, otherwise we do nothing
      const oldTx = await TransactionService.get(out.address.hash, walletTransaction.hash);
      // if the transaction doesn't exist, we add transaction to database
      if (null === oldTx) {
        const tx = await TransactionService.create(walletType, out.address.walletId, inputAddressHashes, out.address.hash, walletTransaction.hash, walletTransaction.data, walletsConfig[walletType].coin.code, out.value, blockHeight);
        transactions.push(tx);
      }
      // if the transaction exists and is not confirmed, we confirm it
      else if (blockHeight && !oldTx.blockHeight) {
        await TransactionService.confirm(oldTx, blockHeight);
        transactions.push(oldTx);
      }
    }
    return transactions;
  }

  private static async handleTokenTransaction(walletType: WalletTypes, walletTransaction: TokenTransaction, blockHeight?: number): Promise<Transaction | undefined> {
    // if the transaction is not sending money to us, we have nothing to do with it
    const address = await AddressService.get(walletTransaction.from);
    if (!address) return;
    const active = await AddressService.isActive(address.walletType, address.walletId, walletTransaction.from);
    if (!active) return;
    // if transaction already exists, don't insert it again, and if possible confirm it
    const oldTx = await TransactionService.get(walletTransaction.to, walletTransaction.hash);
    if (oldTx) {
      if (blockHeight && !oldTx.blockHeight) await TransactionService.confirm(oldTx, blockHeight);
      return;
    }
    // if we don't have any token associated to the contract address, do nothing
    const currency = walletsConfig[walletType].tokens.find(c => c.contractAddress === walletTransaction.contractAddress);
    if (undefined === currency) {
      return;
    }
    return await TransactionService.create(
      walletType,
      address.walletId,
      [walletTransaction.from],
      walletTransaction.to,
      walletTransaction.hash,
      walletTransaction.data,
      currency.code,
      walletTransaction.value,
      blockHeight,
    );
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
    const wallet = w.create(walletType);
    const fromPouchAddr = await wallet.getAddress(fromAddr.index, fromAddr.accountIndex);
    const transaction = await wallet.createTransaction(fromPouchAddr, to, amount);
    await wallet.broadcastTransaction(transaction);
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
    const wallet = w.create(walletType);
    const fromPouchAddr = await wallet.getAddress(fromAddr.index, fromAddr.accountIndex);
    const transaction = await wallet.createTokenTransaction(contractAddress, fromPouchAddr, to, amount);
    await wallet.broadcastTransaction(transaction);
    return transaction.hash;
  }
}
