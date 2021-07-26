import { MigrationInterface, QueryRunner } from "typeorm";

export class secondary1627263189880 implements MigrationInterface {
    name = "secondary1627263189880";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "departments" DROP CONSTRAINT "FK_334b23b781f57a4113bd0eef86d"`
        );
        await queryRunner.query(
            `ALTER TABLE "departments" DROP CONSTRAINT "FK_16d3333406d0e7b64b95d51d22e"`
        );
        await queryRunner.query(
            `ALTER TABLE "lecture" RENAME COLUMN "year" TO "duration"`
        );
        await queryRunner.query(
            `ALTER TABLE "exam" RENAME COLUMN "year" TO "duration"`
        );
        await queryRunner.query(
            `CREATE TABLE "question_solution" ("id" SERIAL NOT NULL, "solutionText" character varying, "solutionChoices" text array, "questionId" uuid, "studentsExamDataId" uuid, CONSTRAINT "PK_811b6c3fc71696f2ee528419f62" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `ALTER TABLE "departments" DROP COLUMN "lecturesId"`
        );
        await queryRunner.query(
            `ALTER TABLE "departments" DROP COLUMN "examsId"`
        );
        await queryRunner.query(
            `CREATE TYPE "report_incident_type_enum" AS ENUM('different_face', 'forbidden_object')`
        );
        await queryRunner.query(
            `ALTER TABLE "report" ADD "incident_type" "report_incident_type_enum" NOT NULL`
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "report"."incident_type" IS 'type of incident'`
        );
        await queryRunner.query(
            `ALTER TABLE "students_exam_data" ADD "secondary_secret" character varying`
        );
        await queryRunner.query(
            `ALTER TABLE "students_exam_data" ADD "secondary_videoPath" character varying`
        );
        await queryRunner.query(
            `ALTER TABLE "students_exam_data" ADD "last_record_primary" TIMESTAMP`
        );
        await queryRunner.query(
            `ALTER TABLE "students_exam_data" ADD "last_record_secondary" TIMESTAMP`
        );
        await queryRunner.query(
            `ALTER TABLE "students_exam_data" ADD "currentQuestionIndex" integer NOT NULL DEFAULT '-1'`
        );
        await queryRunner.query(
            `ALTER TABLE "embedding" ALTER COLUMN "vector" TYPE numeric(21,20) array`
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "embedding"."vector" IS NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "question_solution" ADD CONSTRAINT "FK_4be089b46751375c26ba26d4c6e" FOREIGN KEY ("questionId") REFERENCES "exam_question"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "question_solution" ADD CONSTRAINT "FK_2fcdab7652a61e9e3624a64e658" FOREIGN KEY ("studentsExamDataId") REFERENCES "students_exam_data"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "question_solution" DROP CONSTRAINT "FK_2fcdab7652a61e9e3624a64e658"`
        );
        await queryRunner.query(
            `ALTER TABLE "question_solution" DROP CONSTRAINT "FK_4be089b46751375c26ba26d4c6e"`
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "embedding"."vector" IS NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "embedding" ALTER COLUMN "vector" TYPE numeric array`
        );
        await queryRunner.query(
            `ALTER TABLE "students_exam_data" DROP COLUMN "currentQuestionIndex"`
        );
        await queryRunner.query(
            `ALTER TABLE "students_exam_data" DROP COLUMN "last_record_secondary"`
        );
        await queryRunner.query(
            `ALTER TABLE "students_exam_data" DROP COLUMN "last_record_primary"`
        );
        await queryRunner.query(
            `ALTER TABLE "students_exam_data" DROP COLUMN "secondary_videoPath"`
        );
        await queryRunner.query(
            `ALTER TABLE "students_exam_data" DROP COLUMN "secondary_secret"`
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "report"."incident_type" IS 'type of incident'`
        );
        await queryRunner.query(
            `ALTER TABLE "report" DROP COLUMN "incident_type"`
        );
        await queryRunner.query(`DROP TYPE "report_incident_type_enum"`);
        await queryRunner.query(`ALTER TABLE "departments" ADD "examsId" uuid`);
        await queryRunner.query(
            `ALTER TABLE "departments" ADD "lecturesId" uuid`
        );
        await queryRunner.query(`DROP TABLE "question_solution"`);
        await queryRunner.query(
            `ALTER TABLE "exam" RENAME COLUMN "duration" TO "year"`
        );
        await queryRunner.query(
            `ALTER TABLE "lecture" RENAME COLUMN "duration" TO "year"`
        );
        await queryRunner.query(
            `ALTER TABLE "departments" ADD CONSTRAINT "FK_16d3333406d0e7b64b95d51d22e" FOREIGN KEY ("lecturesId") REFERENCES "lecture"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "departments" ADD CONSTRAINT "FK_334b23b781f57a4113bd0eef86d" FOREIGN KEY ("examsId") REFERENCES "exam"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
    }
}
