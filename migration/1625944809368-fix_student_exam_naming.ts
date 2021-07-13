import { MigrationInterface, QueryRunner } from "typeorm";

export class fixStudentExamNaming1625944809368 implements MigrationInterface {
    name = "fixStudentExamNaming1625944809368";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TYPE "students_exam_data_testingstatus_enum" AS ENUM('idle', 'pending', 'empty')`
        );
        await queryRunner.query(
            `CREATE TABLE "students_exam_data" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "mark" integer, "examReport" jsonb, "testingStatus" "students_exam_data_testingstatus_enum" NOT NULL DEFAULT 'empty', "videoPath" character varying, "studentId" uuid, "examId" uuid, CONSTRAINT "PK_bf89c9a7ed39990cc3bbb9210f8" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `ALTER TABLE "lecture" ADD "recording_path" character varying`
        );
        await queryRunner.query(
            `ALTER TABLE "embedding" ALTER COLUMN "vector" TYPE numeric(21,20) array`
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "embedding"."vector" IS NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "students_exam_data" ADD CONSTRAINT "FK_f9cc7d3966d37a1681a47770013" FOREIGN KEY ("studentId") REFERENCES "student"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "students_exam_data" ADD CONSTRAINT "FK_2462fee30511d31f27f00e688dd" FOREIGN KEY ("examId") REFERENCES "exam"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "students_exam_data" DROP CONSTRAINT "FK_2462fee30511d31f27f00e688dd"`
        );
        await queryRunner.query(
            `ALTER TABLE "students_exam_data" DROP CONSTRAINT "FK_f9cc7d3966d37a1681a47770013"`
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "embedding"."vector" IS NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "embedding" ALTER COLUMN "vector" TYPE numeric array`
        );
        await queryRunner.query(
            `ALTER TABLE "lecture" DROP COLUMN "recording_path"`
        );
        await queryRunner.query(`DROP TABLE "students_exam_data"`);
        await queryRunner.query(
            `DROP TYPE "students_exam_data_testingstatus_enum"`
        );
    }
}
