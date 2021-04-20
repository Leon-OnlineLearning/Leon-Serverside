import {MigrationInterface, QueryRunner} from "typeorm";

export class AddEmbedding1618946578017 implements MigrationInterface {
    name = 'AddEmbedding1618946578017'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `embedding` (`vector` varchar(2048) NOT NULL, `id` varchar(36) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `student` ADD `embeddingId` varchar(36) NULL");
        await queryRunner.query("ALTER TABLE `student` ADD UNIQUE INDEX `IDX_e37af156fe109a0c491a40afe2` (`embeddingId`)");
        await queryRunner.query("ALTER TABLE `student` ADD CONSTRAINT `FK_e37af156fe109a0c491a40afe29` FOREIGN KEY (`embeddingId`) REFERENCES `embedding`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `student` DROP FOREIGN KEY `FK_e37af156fe109a0c491a40afe29`");
        await queryRunner.query("DROP INDEX `REL_e37af156fe109a0c491a40afe2` ON `student`");
        await queryRunner.query("ALTER TABLE `student` DROP INDEX `IDX_e37af156fe109a0c491a40afe2`");
        await queryRunner.query("ALTER TABLE `student` DROP COLUMN `embeddingId`");
        await queryRunner.query("DROP TABLE `embedding`");
    }

}
