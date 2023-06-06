import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column('varchar', { name: 'wallet_type' })
  walletType: string;

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

  @Column('int', { name: 'block_height' })
  blockHeight?: number;

  @Column('boolean')
  spent: boolean = false;

  @Column('timestamp', { name: 'created_at' })
  createdAt: Date;
}
