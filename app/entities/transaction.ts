import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { WalletTypes } from 'pouch';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column('varchar', { name: 'wallet_type' })
  walletType: WalletTypes;

  @Column('varchar', { name: 'wallet_id' })
  walletId: string;

  @Column('json')
  from: string[];

  @Column('varchar')
  to: string;

  @Column('varchar')
  hash: string;

  @Column('text')
  data: string;

  @Column('bigint')
  value: string;

  @Column('varchar')
  currency: string;

  @Column('int', { name: 'block_height', nullable: true })
  blockHeight?: number | null;

  @Column('timestamp', { name: 'created_at' })
  createdAt: Date;
}
