import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity('pairs')
export class Pair {
  @PrimaryColumn({ type: 'varchar' })
  key: string;

  @Column('json')
  value: any;
}
