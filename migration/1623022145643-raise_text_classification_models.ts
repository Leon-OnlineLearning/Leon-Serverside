import { MigrationInterface, QueryRunner } from "typeorm";

export class raiseTextClassificationModels1623022145643
    implements MigrationInterface {
    name = "raiseTextClassificationModels1623022145643";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "text_classification_model" DROP CONSTRAINT "FK_8f5c7a1b67b0ed3446afaa50d22"`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model" DROP COLUMN "modelPath"`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model" DROP COLUMN "superModuleId"`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model" ADD "stateFilePath" character varying`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model" ADD "state" jsonb`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model" ADD "trainingModelPath" character varying`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model" ADD "superModelId" uuid`
        );
        await queryRunner.query(
            `ALTER TABLE "embedding" ALTER COLUMN "vector" TYPE numeric(21,20) array`
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "embedding"."vector" IS NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model" DROP COLUMN "accuracy"`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model" ADD "accuracy" numeric(21,20)`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model" ADD CONSTRAINT "FK_ff9de0b555d467fd5c594d15ce7" FOREIGN KEY ("superModelId") REFERENCES "text_classification_model"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "text_classification_model" DROP CONSTRAINT "FK_ff9de0b555d467fd5c594d15ce7"`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model" DROP COLUMN "accuracy"`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model" ADD "accuracy" integer`
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "embedding"."vector" IS NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "embedding" ALTER COLUMN "vector" TYPE numeric array`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model" DROP COLUMN "superModelId"`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model" DROP COLUMN "trainingModelPath"`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model" DROP COLUMN "state"`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model" DROP COLUMN "stateFilePath"`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model" ADD "superModuleId" uuid`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model" ADD "modelPath" character varying`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model" ADD CONSTRAINT "FK_8f5c7a1b67b0ed3446afaa50d22" FOREIGN KEY ("superModuleId") REFERENCES "text_classification_model"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
    }
}
