import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class CreateTransactionsTable1682755261082 implements MigrationInterface {

  public createTable(): Table {
    return new Table({
      name: 'transactions',
      columns: [
        { name: 'id', type: 'bigint', unsigned: true, isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
        { name: 'wallet_type', type: 'varchar' },
        { name: 'wallet_id', type: 'char', length: '64' },
        { name: 'from', type: 'json' },
        { name: 'to', type: 'varchar' },
        { name: 'hash', type: 'varchar' },
        { name: 'data', type: 'text' },
        { name: 'value', type: 'bigint', unsigned: true },
        { name: 'currency', type: 'varchar' },
        { name: 'block_height', type: 'int', unsigned: true, isNullable: true },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP()' },
      ],
      indices: [
        { columnNames: ['to', 'hash'], isUnique: true },
      ]
    });
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(this.createTable());
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.createTable(), true);
  }

}
