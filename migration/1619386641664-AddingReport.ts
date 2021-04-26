import { MigrationInterface, QueryRunner } from "typeorm";

export class AddingReport1619386641664 implements MigrationInterface {
    name = "AddingReport1619386641664";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "report" DROP COLUMN "result"`);
        await queryRunner.query(
            `ALTER TABLE "report" DROP COLUMN "startingFrom"`
        );
        await queryRunner.query(
            `ALTER TABLE "report" ADD "startingFrom" integer NOT NULL`
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "report"."startingFrom" IS 'time in seconds from begging'`
        );
        await queryRunner.query(`ALTER TABLE "report" DROP COLUMN "endingAt"`);
        await queryRunner.query(
            `ALTER TABLE "report" ADD "endingAt" integer NOT NULL`
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "report"."endingAt" IS 'time in seconds from begging'`
        );
        await queryRunner.query(
            `ALTER TABLE "embedding" ALTER COLUMN "vector" TYPE numeric(21,20) array`
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "embedding"."vector" IS NULL`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `COMMENT ON COLUMN "embedding"."vector" IS NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "embedding" ALTER COLUMN "vector" TYPE numeric array`
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "report"."endingAt" IS 'time in seconds from begging'`
        );
        await queryRunner.query(`ALTER TABLE "report" DROP COLUMN "endingAt"`);
        await queryRunner.query(
            `ALTER TABLE "report" ADD "endingAt" TIMESTAMP NOT NULL`
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "report"."startingFrom" IS 'time in seconds from begging'`
        );
        await queryRunner.query(
            `ALTER TABLE "report" DROP COLUMN "startingFrom"`
        );
        await queryRunner.query(
            `ALTER TABLE "report" ADD "startingFrom" TIMESTAMP NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "report" ADD "result" character varying(1) NOT NULL`
        );
    }
}
