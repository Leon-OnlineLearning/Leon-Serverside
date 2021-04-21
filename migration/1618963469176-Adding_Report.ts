import { MigrationInterface, QueryRunner } from "typeorm";

export class AddingReport1618963469176 implements MigrationInterface {
  name = "AddingReport1618963469176";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "CREATE TABLE `report` (`id` varchar(36) NOT NULL, `startingFrom` datetime NOT NULL, `endingAt` datetime NOT NULL, `result` tinyint NOT NULL, `studentId` varchar(36) NULL, `examId` varchar(36) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB"
    );
    await queryRunner.query(
      "ALTER TABLE `report` ADD CONSTRAINT `FK_43eef8080ece60ccb041dd31809` FOREIGN KEY (`studentId`) REFERENCES `student`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION"
    );
    await queryRunner.query(
      "ALTER TABLE `report` ADD CONSTRAINT `FK_43ee63268434d93f7896a50f308` FOREIGN KEY (`examId`) REFERENCES `exam`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION"
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `report` DROP FOREIGN KEY `FK_43ee63268434d93f7896a50f308`"
    );
    await queryRunner.query(
      "ALTER TABLE `report` DROP FOREIGN KEY `FK_43eef8080ece60ccb041dd31809`"
    );
    await queryRunner.query("DROP TABLE `report`");
  }
}
