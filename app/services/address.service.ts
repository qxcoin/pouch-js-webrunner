import { WalletTypes } from 'pouch';
import dataSource from '@app/data-source.js';
import { Address } from '@entities/address.js';
import w, { walletId } from "@app/wallet.js";
import { TransactionService } from './transaction.service';

export class AddressService {

  /**
   * Get an address by its hash.
   */
  public static async get(hash: string): Promise<Address | null> {
    const repo = dataSource.getRepository(Address);
    const address = await repo.findOneBy({ hash });
    return address;
  }

  /**
   * Get last active address of current wallet and group or create an address if no address exists.
   * NOTE: Active addresses are last address of each group.
   */
  public static async getActive(walletType: WalletTypes, groupId: string, fresh: boolean = false): Promise<Address> {
    const repo = dataSource.getRepository(Address);
    const address = await repo.findOne({ where: { walletType, walletId, groupId }, order: { id: 'desc' } });
    if (fresh || address === null) {
      return await this.create(walletType, groupId, await this.nextIndex(walletType), 0);
    } else {
      return address;
    }
  }

  /**
   * Get active addresses of current wallet.
   * NOTE: Active addresses are last address of each group.
   */
  public static async getAllActive(): Promise<Address[]> {
    const repo = dataSource.getRepository(Address);
    const qb = repo.createQueryBuilder('address');
    const sq = qb.subQuery();
    sq.select('MAX(subAddress.id)');
    sq.from(Address, 'subAddress');
    sq.where('subAddress.wallet_id = :walletId', { walletId });
    sq.groupBy('subAddress.group_id');
    qb.where('address.id IN ' + sq.getQuery());
    qb.cache(2 * 60 * 1000);
    return await qb.getMany();
  }

  /**
   * Determines if we have an active address with provided hash in current wallet.
   */
  public static async hasActive(hash: string): Promise<boolean> {
    const addresses = await AddressService.getAllActive();
    for (const address of addresses) if (address.hash === hash) return true;
    return false;
  }

  /**
   * Get next index for address of current wallet.
   */
  public static async nextIndex(walletType: WalletTypes): Promise<number> {
    const repo = dataSource.getRepository(Address);
    const address = await repo.findOne({ where: { walletType, walletId }, order: { id: 'desc' } });
    return address ? (address.index + 1) : 0;
  }

  public static async create(walletType: WalletTypes, groupId: string, index: number, accountIndex: number): Promise<Address> {
    const repo = dataSource.getRepository(Address);
    const address = new Address();
    address.walletType = walletType;
    address.walletId = walletId;
    address.index = index;
    address.accountIndex = accountIndex;
    address.groupId = groupId;
    address.hash = (await w.create(walletType).getAddress(index, accountIndex)).hash;
    await repo.save(address);
    return address;
  }

  public static async getBalance(addressHash: string, currency: string, walletType: WalletTypes): Promise<bigint> {
    // in order to get balance of an address we need to
    // find all unspent transactions of that address and summarize their value
    const transactions = await TransactionService.findSpendable(addressHash, currency, walletType);
    let sum = 0n;
    for (const t of transactions) sum += BigInt(t.value);
    return sum;
  }

}
