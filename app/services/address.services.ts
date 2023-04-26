import { WalletTypes } from 'pouch';
import dataSource from '@app/data-source.js';
import { Address } from '@entities/address.js';
import w, { walletId } from "@app/wallet.js";

export class AddressService {

  public static async get(walletType: WalletTypes, groupId: string, fresh: boolean = false) {
    const repo = dataSource.getRepository(Address);
    const address = await repo.findOne({ where: { walletType, walletId, groupId }, order: { id: 'desc' } });
    if (fresh || address === null) {
      return await this.create(walletType, groupId, await this.nextIndex(walletType), 0);
    } else {
      return address;
    }
  }

  public static async nextIndex(walletType: WalletTypes): Promise<number> {
    const repo = dataSource.getRepository(Address);
    const address = await repo.findOne({ where: { walletType, walletId }, order: { id: 'desc' } });
    return address ? (address.index + 1) : 0;
  }

  public static async create(walletType: WalletTypes, groupId: string, index: number, accountIndex: number) {
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

}
