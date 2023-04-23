import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column('varchar', { name: 'wallet_type' })
  walletType: string;

  @Column('varchar', { name: 'wallet_id' })
  walletId: string;

  @Column('bigint')
  index: string;

  @Column('bigint', { name: 'account_index' })
  accountIndex: string;

  @Column('varchar')
  hash: string;

  @Column('timestamp', { name: 'created_at' })
  createdAt: Date;
}
