import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class CreateAddressesTable1682101968833 implements MigrationInterface {

  public createTable(): Table {
    return new Table({
      name: 'addresses',
      columns: [
        { name: 'id', type: 'bigint', unsigned: true, isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
        { name: 'wallet_type', type: 'varchar' },
        { name: 'wallet_id', type: 'char', length: '64' },
        { name: 'account_index', type: 'int', unsigned: true },
        { name: 'index', type: 'int', unsigned: true },
        { name: 'hash', type: 'varchar' },
        { name: 'group_id', type: 'varchar' },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP()' },
      ],
      indices: [
        { columnNames: ['wallet_type', 'wallet_id', 'account_index', 'index'], isUnique: true },
        { columnNames: ['hash'], isUnique: true },
        { columnNames: ['wallet_type', 'wallet_id', 'group_id'] },
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
