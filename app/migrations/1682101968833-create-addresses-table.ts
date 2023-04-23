import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class CreateAddressesTable1682101968833 implements MigrationInterface {

  public createTable(): Table {
    return new Table({
      name: 'addresses',
      columns: [
        { name: 'id', type: 'bigint', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
        { name: 'wallet_type', type: 'varchar' },
        { name: 'wallet_id', type: 'varchar' },
        { name: 'index', type: 'bigint' },
        { name: 'account_index', type: 'bigint' },
        { name: 'hash', type: 'varchar' },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP()' },
      ],
      indices: [
        { columnNames: ['wallet_type', 'wallet_id', 'index', 'account_index'], isUnique: true }
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
