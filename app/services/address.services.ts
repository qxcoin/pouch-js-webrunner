import { WalletTypes } from 'pouch';
import dataSource from '@app/data-source.js';
import { Address } from '@entities/address.js';
import w, { walletId } from "@app/wallet.js";

export class AddressService {

  public static async createAddress(walletType: WalletTypes, index: number, accountIndex: number) {
    const repo = dataSource.getRepository(Address);
    const oldAddress = await repo.findOneBy({ walletId, walletType, index: index.toString(), accountIndex: accountIndex.toString() });
    if (null !== oldAddress) return oldAddress;
    const address = new Address();
    address.walletType = walletType;
    address.walletId = walletId;
    address.index = index.toString();
    address.accountIndex = accountIndex.toString();
    address.hash = (await w.create(walletType).getAddress(index, accountIndex)).hash;
    await repo.save(address);
    return address;
  }

}
