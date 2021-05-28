import { MigrationInterface, QueryRunner } from "typeorm";

export class addModelLog1622200854919 implements MigrationInterface {
    name = "addModelLog1622200854919";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "text_classification_model" RENAME COLUMN "rasingModelPath" TO "modelPath"`
        );
        await queryRunner.query(
            `CREATE TABLE "text_classification_model_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "modelId" uuid, CONSTRAINT "PK_b56eecefaadb59ab05694709345" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `ALTER TABLE "embedding" ALTER COLUMN "vector" TYPE numeric(21,20) array`
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "embedding"."vector" IS NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model_log" ADD CONSTRAINT "FK_e98b1dbf02734016d4d4258b583" FOREIGN KEY ("modelId") REFERENCES "text_classification_model"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "text_classification_model_log" DROP CONSTRAINT "FK_e98b1dbf02734016d4d4258b583"`
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "embedding"."vector" IS NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "embedding" ALTER COLUMN "vector" TYPE numeric array`
        );
        await queryRunner.query(`DROP TABLE "text_classification_model_log"`);
        await queryRunner.query(
            `ALTER TABLE "text_classification_model" RENAME COLUMN "modelPath" TO "rasingModelPath"`
        );
    }
}
