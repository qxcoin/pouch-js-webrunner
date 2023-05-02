import { RawTransaction, Transaction, TokenTransaction, WalletTypes } from 'pouch';
import w, { walletId } from "@app/wallet.js";
import { AddressService } from './address.service.js';
import { TransactionService } from './transaction.service.js';
import wallet from '@app/wallet.js';

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

  public static async handleTransaction(walletType: WalletTypes, transaction: Transaction | TokenTransaction, blockHeight?: number) {
    if (transaction instanceof TokenTransaction)
      return this.handleTokenTransaction(walletType, transaction, blockHeight);
    const outputs: { address: string, value: bigint }[] = [];
    for (const out of transaction.outputs) {
      const address = await out.address();
      if (await AddressService.hasActive(address)) {
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
      if (await TransactionService.has(out.address, transaction.hash)) continue;
      TransactionService.create(walletType, inputAddresses, out.address, transaction.hash, transaction.data, out.value, blockHeight);
    }
  }

  private static async handleTokenTransaction(walletType: WalletTypes, transaction: TokenTransaction, blockHeight?: number) {
    // if the transaction is not sending money to us, we have nothing to do with it
    if (!(await AddressService.hasActive(transaction.from))) return;
    // if transaction already exists, don't insert it again
    if (await TransactionService.has(transaction.to, transaction.hash)) return;
    TransactionService.create(walletType, [transaction.from], transaction.to, transaction.hash, transaction.data, transaction.value, blockHeight);
  }

  public static async transfer(walletType: WalletTypes, from: string, to: string, amount: bigint): Promise<string> {
    const fromAddr = await AddressService.get(from);
    if (null === fromAddr) throw new Error('From address not found in wallet.');
    if (walletType !== fromAddr.walletType || walletId !== fromAddr.walletId) throw new Error('From address is not part of current wallet.');
    const transactions = await TransactionService.findSpendable(walletType, from, amount);
    const w = wallet.create(walletType);
    const fromPouchAddr = await w.getAddress(fromAddr.index, fromAddr.accountIndex);
    const spending = transactions.map((t) => new RawTransaction(t.hash, t.data));
    const transaction = await w.createTransaction(fromPouchAddr, to, amount, spending);
    await w.broadcastTransaction(transaction);
    await TransactionService.spend(transactions);
    return transaction.hash;
  }

  public static async transferToken(walletType: WalletTypes, contractAddress: string, from: string, to: string, amount: bigint): Promise<string> {
    const fromAddr = await AddressService.get(from);
    if (null === fromAddr) throw new Error('From address not found in wallet.');
    if (walletType !== fromAddr.walletType || walletId !== fromAddr.walletId) throw new Error('From address is not part of current wallet.');
    const transactions = await TransactionService.findSpendable(walletType, from, amount);
    const w = wallet.create(walletType);
    const fromPouchAddr = await w.getAddress(fromAddr.index, fromAddr.accountIndex);
    const transaction = await w.createTokenTransaction(contractAddress, fromPouchAddr, to, amount);
    await w.broadcastTransaction(transaction);
    await TransactionService.spend(transactions);
    return transaction.hash;
  }
}
