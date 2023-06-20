import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { WalletTypes } from 'pouch';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column('varchar', { name: 'wallet_type' })
  walletType: WalletTypes;

  @Column('varchar', { name: 'wallet_id' })
  walletId: string;

  @Column('varchar', { name: 'group_id' })
  groupId: string;

  @Column('int', { name: 'account_index' })
  accountIndex: number;

  @Column('int')
  index: number;

  @Column('varchar')
  hash: string;

  @Column('timestamp', { name: 'created_at' })
  createdAt: Date;
}
