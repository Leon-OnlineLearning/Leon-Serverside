import { MigrationInterface, QueryRunner } from "typeorm";

export class changeProfessorCourseName1621252539781
    implements MigrationInterface {
    name = "changeProfessorCourseName1621252539781";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "professors_courses" ("professorId" uuid NOT NULL, "courseId" uuid NOT NULL, CONSTRAINT "PK_61f39f0b7bbe7101fc6c6a786ed" PRIMARY KEY ("professorId", "courseId"))`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_dde4c31570da57036baa6a8aae" ON "professors_courses" ("professorId") `
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_d4e25026356e437d6ede4dd493" ON "professors_courses" ("courseId") `
        );
        await queryRunner.query(
            `ALTER TABLE "embedding" ALTER COLUMN "vector" TYPE numeric(21,20) array`
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "embedding"."vector" IS NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "professors_courses" ADD CONSTRAINT "FK_dde4c31570da57036baa6a8aae4" FOREIGN KEY ("professorId") REFERENCES "professor"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "professors_courses" ADD CONSTRAINT "FK_d4e25026356e437d6ede4dd4935" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "professor_courses_course" DROP CONSTRAINT "FK_6eb199629534b22f498dec9567e"`
        );
        await queryRunner.query(
            `ALTER TABLE "professor_courses_course" DROP CONSTRAINT "FK_d8e718fbdea73702563e6cfecb2"`
        );
        await queryRunner.query(`DROP TABLE "professor_courses_course"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "professors_courses" DROP CONSTRAINT "FK_d4e25026356e437d6ede4dd4935"`
        );
        await queryRunner.query(
            `ALTER TABLE "professors_courses" DROP CONSTRAINT "FK_dde4c31570da57036baa6a8aae4"`
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "embedding"."vector" IS NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "embedding" ALTER COLUMN "vector" TYPE numeric array`
        );
        await queryRunner.query(`DROP INDEX "IDX_d4e25026356e437d6ede4dd493"`);
        await queryRunner.query(`DROP INDEX "IDX_dde4c31570da57036baa6a8aae"`);
        await queryRunner.query(`DROP TABLE "professors_courses"`);
        await queryRunner.query(
            `CREATE TABLE "professor_courses_course" ("professorId" uuid NOT NULL, "courseId" uuid NOT NULL, CONSTRAINT "PK_0f9c01ffaf4f1c5c1737fe26c5f" PRIMARY KEY ("professorId", "courseId"))`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_d8e718fbdea73702563e6cfecb" ON "professor_courses_course" ("professorId") `
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_6eb199629534b22f498dec9567" ON "professor_courses_course" ("courseId") `
        );
        await queryRunner.query(
            `ALTER TABLE "professor_courses_course" ADD CONSTRAINT "FK_d8e718fbdea73702563e6cfecb2" FOREIGN KEY ("professorId") REFERENCES "professor"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "professor_courses_course" ADD CONSTRAINT "FK_6eb199629534b22f498dec9567e" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );
    }
}
