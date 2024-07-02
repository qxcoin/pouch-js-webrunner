import { WalletTypes } from 'pouch';
import dataSource from '@app/data-source.js';
import { Address } from '@entities/address.js';
import w from "@app/wallet.js";
import { wallets as walletsConfig } from '@app/config.js';

export class AddressService {

  /**
   * Get an address by its hash.
   */
  public static async get(hash: string): Promise<Address | null> {
    const repo = dataSource.getRepository(Address);
    const address = await repo.findOneBy({ hash });
    return address;
  }

  public static async getByIndex(walletType: WalletTypes, walletId: string, index: number, accountIndex: number): Promise<Address | null> {
    const repo = dataSource.getRepository(Address);
    const address = await repo.findOneBy({ walletType, walletId, index, accountIndex });
    return address;
  }

  /**
   * Get last active address of provided wallet and group or create an address if no address exists.
   * NOTE: Active addresses are last address of each group.
   */
  public static async getActive(walletType: WalletTypes, walletId: string, groupId: string, accountIndex: number, fresh: boolean = false): Promise<Address> {
    const repo = dataSource.getRepository(Address);
    const address = await repo.findOne({ where: { walletType, walletId, groupId, accountIndex }, order: { id: 'desc' } });
    if (fresh || address === null) {
      return await this.create(walletType, walletId, groupId, await this.nextIndex(walletType, walletId, accountIndex), accountIndex);
    } else {
      return address;
    }
  }

  /**
   * Get all active addresses of provided wallet.
   * NOTE: Active addresses are last address of each group.
   */
  public static async getAllActive(walletType: WalletTypes, walletId: string): Promise<Address[]> {
    const repo = dataSource.getRepository(Address);
    const qb = repo.createQueryBuilder('address');
    const sq = qb.subQuery();
    sq.select('MAX(subAddress.id)');
    sq.from(Address, 'subAddress');
    sq.where('subAddress.wallet_type = :walletType', { walletType });
    sq.andWhere('subAddress.wallet_id = :walletId', { walletId });
    sq.groupBy('subAddress.group_id');
    qb.where('address.id IN ' + sq.getQuery());
    qb.cache(2 * 60 * 1000);
    return await qb.getMany();
  }

  /**
   * Determines if the address is active in provided wallet.
   */
  public static async isActive(walletType: WalletTypes, walletId: string, hash: string): Promise<boolean> {
    const addresses = await AddressService.getAllActive(walletType, walletId);
    for (const address of addresses) if (address.hash === hash) return true;
    return false;
  }

  /**
   * Get next index for address of provided wallet.
   */
  public static async nextIndex(walletType: WalletTypes, walletId: string, accountIndex: number): Promise<number> {
    const repo = dataSource.getRepository(Address);
    const address = await repo.findOne({ where: { walletType, walletId, accountIndex }, order: { id: 'desc' } });
    return address ? (address.index + 1) : 0;
  }

  public static async create(walletType: WalletTypes, walletId: string, groupId: string, index: number, accountIndex: number): Promise<Address> {
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

  public static async getBalance(walletType: WalletTypes, currency: string, addressHash: string): Promise<bigint> {
    const wallet = w.create(walletType);
    const conf = walletsConfig[walletType];
    if (conf['coin'].code === currency) {
      return await wallet.getAddressBalance(addressHash);
    }
    const token = conf['tokens'].find(c => c.code === currency);
    if (token) {
      return await wallet.getAddressTokenBalance(token.contractAddress, addressHash);
    }
    throw new Error(`Currency [${currency}] is not supported.`);
  }

}
