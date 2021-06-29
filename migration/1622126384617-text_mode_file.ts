import { MigrationInterface, QueryRunner } from "typeorm";

export class textModeFile1622126384617 implements MigrationInterface {
    name = "textModeFile1622126384617";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TYPE "text_classification_file_filetype_enum" AS ENUM('related', 'non-related')`
        );
        await queryRunner.query(
            `CREATE TABLE "text_classification_file" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fileType" "text_classification_file_filetype_enum" NOT NULL, "filePath" character varying NOT NULL, CONSTRAINT "PK_e7746d1926ec762927a012299ef" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "text_classification_model_file" ("related" boolean NOT NULL, "className" character varying NOT NULL, "modelId" uuid NOT NULL, "fileId" uuid NOT NULL, CONSTRAINT "PK_aeca0f595268cd0382cb64bb3e1" PRIMARY KEY ("modelId", "fileId"))`
        );
        await queryRunner.query(
            `ALTER TABLE "embedding" ALTER COLUMN "vector" TYPE numeric(21,20) array`
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "embedding"."vector" IS NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model_file" ADD CONSTRAINT "FK_81449a7bcfd92c0e6e3f601131d" FOREIGN KEY ("modelId") REFERENCES "text_classification_model"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model_file" ADD CONSTRAINT "FK_4038d735da3b0428eeb5bf965b8" FOREIGN KEY ("fileId") REFERENCES "text_classification_file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "text_classification_model_file" DROP CONSTRAINT "FK_4038d735da3b0428eeb5bf965b8"`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model_file" DROP CONSTRAINT "FK_81449a7bcfd92c0e6e3f601131d"`
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "embedding"."vector" IS NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "embedding" ALTER COLUMN "vector" TYPE numeric array`
        );
        await queryRunner.query(`DROP TABLE "text_classification_model_file"`);
        await queryRunner.query(`DROP TABLE "text_classification_file"`);
        await queryRunner.query(
            `DROP TYPE "text_classification_file_filetype_enum"`
        );
    }
}
