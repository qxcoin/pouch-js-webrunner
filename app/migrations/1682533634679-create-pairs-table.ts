import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class CreatePairsTable1682533634679 implements MigrationInterface {

  public createTable(): Table {
    return new Table({
      name: 'pairs',
      columns: [
        { name: 'key', type: 'varchar', isPrimary: true },
        { name: 'value', type: 'json' },
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
