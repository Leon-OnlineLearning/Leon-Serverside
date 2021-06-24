import { MigrationInterface, QueryRunner } from "typeorm";

export class textClassifier1624428604428 implements MigrationInterface {
    name = "textClassifier1624428604428";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "students_exams" ADD "examReport" jsonb`
        );
        await queryRunner.query(
            `CREATE TYPE "students_exams_testingstatus_enum" AS ENUM('idle', 'pending', 'empty')`
        );
        await queryRunner.query(
            `ALTER TABLE "students_exams" ADD "testingStatus" "students_exams_testingstatus_enum" NOT NULL DEFAULT 'empty'`
        );
        await queryRunner.query(
            `ALTER TABLE "students_exams" ADD "videoPath" character varying`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model" ADD "primeModelId" uuid`
        );
        await queryRunner.query(
            `ALTER TABLE "course" ADD "lastTestResults" jsonb`
        );
        await queryRunner.query(
            `CREATE TYPE "course_testingstate_enum" AS ENUM('idle', 'pending', 'empty')`
        );
        await queryRunner.query(
            `ALTER TABLE "course" ADD "testingState" "course_testingstate_enum" NOT NULL DEFAULT 'empty'`
        );
        await queryRunner.query(
            `ALTER TABLE "embedding" ALTER COLUMN "vector" TYPE numeric(21,20) array`
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "embedding"."vector" IS NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "students_exams" ALTER COLUMN "mark" DROP NOT NULL`
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "students_exams"."mark" IS NULL`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `COMMENT ON COLUMN "students_exams"."mark" IS NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "students_exams" ALTER COLUMN "mark" SET NOT NULL`
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "embedding"."vector" IS NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "embedding" ALTER COLUMN "vector" TYPE numeric array`
        );
        await queryRunner.query(
            `ALTER TABLE "course" DROP COLUMN "testingState"`
        );
        await queryRunner.query(`DROP TYPE "course_testingstate_enum"`);
        await queryRunner.query(
            `ALTER TABLE "course" DROP COLUMN "lastTestResults"`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model" DROP COLUMN "primeModelId"`
        );
        await queryRunner.query(
            `ALTER TABLE "students_exams" DROP COLUMN "videoPath"`
        );
        await queryRunner.query(
            `ALTER TABLE "students_exams" DROP COLUMN "testingStatus"`
        );
        await queryRunner.query(
            `DROP TYPE "students_exams_testingstatus_enum"`
        );
        await queryRunner.query(
            `ALTER TABLE "students_exams" DROP COLUMN "examReport"`
        );
    }
}
