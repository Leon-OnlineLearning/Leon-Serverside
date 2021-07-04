import { MigrationInterface, QueryRunner } from "typeorm";

export class DatabaseInit1619053257933 implements MigrationInterface {
    name = "DatabaseInit1619053257933";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "professor" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying, "thirdPartyAccount" boolean DEFAULT false, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "departmentId" uuid, CONSTRAINT "UQ_492e744e6333071da912c7d651b" UNIQUE ("email"), CONSTRAINT "PK_39a6c8f16280dc3bc3ffdc41e02" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "lecture" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "year" integer NOT NULL, "startTime" TIMESTAMP NOT NULL, "endTime" TIMESTAMP NOT NULL, "path" character varying NOT NULL, "courseId" uuid, "professorId" uuid, CONSTRAINT "REL_137552ffd78c2368c74ccf19de" UNIQUE ("professorId"), CONSTRAINT "PK_2abef7c1e52b7b58a9f905c9643" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "student_lecture_attendance" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "studentId" uuid, "lectureId" uuid, CONSTRAINT "PK_b194974eb031906ca0a944ee331" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "report" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "startingFrom" TIMESTAMP NOT NULL, "endingAt" TIMESTAMP NOT NULL, "result" character varying(1) NOT NULL, "studentId" uuid, "examId" uuid, CONSTRAINT "PK_99e4d0bea58cba73c57f935a546" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "embedding" ("vector" numeric(9) array NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), CONSTRAINT "PK_9457e810efc9c802fe5047347d6" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "student" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying, "thirdPartyAccount" boolean DEFAULT false, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "year" integer NOT NULL DEFAULT '0', "departmentId" uuid, "embeddingId" uuid, CONSTRAINT "UQ_a56c051c91dbe1068ad683f536e" UNIQUE ("email"), CONSTRAINT "REL_e37af156fe109a0c491a40afe2" UNIQUE ("embeddingId"), CONSTRAINT "PK_3d8016e1cb58429474a3c041904" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "students_exams" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "mark" integer NOT NULL, "studentId" uuid, "examId" uuid, CONSTRAINT "PK_0920130b8f0d92b00accff50e75" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "exam" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "year" integer NOT NULL, "startTime" TIMESTAMP NOT NULL, "endTime" TIMESTAMP NOT NULL, "mark" integer NOT NULL, "courseId" uuid, "professorId" uuid, CONSTRAINT "PK_56071ab3a94aeac01f1b5ab74aa" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "departments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "lecturesId" uuid, "examsId" uuid, CONSTRAINT "PK_839517a681a86bb84cbcc6a1e9d" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "course" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "departmentsId" uuid, CONSTRAINT "PK_bf95180dd756fd204fb01ce4916" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "admin" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying, "thirdPartyAccount" boolean DEFAULT false, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, CONSTRAINT "UQ_de87485f6489f5d0995f5841952" UNIQUE ("email"), CONSTRAINT "PK_e032310bcef831fb83101899b10" PRIMARY KEY ("id"))`
        );
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
            `CREATE TABLE "student_courses_course" ("studentId" uuid NOT NULL, "courseId" uuid NOT NULL, CONSTRAINT "PK_14a911a16ab76c78f1fe6368a92" PRIMARY KEY ("studentId", "courseId"))`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_29e49d9ad51ffb927f488f0802" ON "student_courses_course" ("studentId") `
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_d13666d470035a399961e1d08c" ON "student_courses_course" ("courseId") `
        );
        await queryRunner.query(
            `CREATE TABLE "DEPARTMENT_COURSES" ("departmentsId" uuid NOT NULL, "courseId" uuid NOT NULL, CONSTRAINT "PK_9eeae6f5b243ea9d87166a42a28" PRIMARY KEY ("departmentsId", "courseId"))`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_e6c478cfd1402822df7b5e2568" ON "DEPARTMENT_COURSES" ("departmentsId") `
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_965801c63747a7f8dc0570e6e4" ON "DEPARTMENT_COURSES" ("courseId") `
        );
        await queryRunner.query(
            `ALTER TABLE "professor" ADD CONSTRAINT "FK_7e281a085f2314de20f6a62fe41" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "lecture" ADD CONSTRAINT "FK_89e61e55d5b02ea76363a3a55a6" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "lecture" ADD CONSTRAINT "FK_137552ffd78c2368c74ccf19de6" FOREIGN KEY ("professorId") REFERENCES "professor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "student_lecture_attendance" ADD CONSTRAINT "FK_e78ee3aed41d963a3a9fd4079c2" FOREIGN KEY ("studentId") REFERENCES "student"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "student_lecture_attendance" ADD CONSTRAINT "FK_52753ba2926a7e545d9827ba873" FOREIGN KEY ("lectureId") REFERENCES "lecture"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "report" ADD CONSTRAINT "FK_43eef8080ece60ccb041dd31809" FOREIGN KEY ("studentId") REFERENCES "student"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "report" ADD CONSTRAINT "FK_43ee63268434d93f7896a50f308" FOREIGN KEY ("examId") REFERENCES "exam"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "student" ADD CONSTRAINT "FK_5055e57181dc1d5ff6f4da7a98c" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "student" ADD CONSTRAINT "FK_e37af156fe109a0c491a40afe29" FOREIGN KEY ("embeddingId") REFERENCES "embedding"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "students_exams" ADD CONSTRAINT "FK_ae4d89d9a5da2b3d43a65ae0b07" FOREIGN KEY ("studentId") REFERENCES "student"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "students_exams" ADD CONSTRAINT "FK_0c9ec9dd610ce25a3896ab580e0" FOREIGN KEY ("examId") REFERENCES "exam"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "exam" ADD CONSTRAINT "FK_e6b0d68b26f7847f2d46810df8f" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "exam" ADD CONSTRAINT "FK_d13e02e30e86bbf25e5e3e7bee8" FOREIGN KEY ("professorId") REFERENCES "professor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "departments" ADD CONSTRAINT "FK_16d3333406d0e7b64b95d51d22e" FOREIGN KEY ("lecturesId") REFERENCES "lecture"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "departments" ADD CONSTRAINT "FK_334b23b781f57a4113bd0eef86d" FOREIGN KEY ("examsId") REFERENCES "exam"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "course" ADD CONSTRAINT "FK_254eaf1f4ac5c87bd1ebc2efce3" FOREIGN KEY ("departmentsId") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "professor_courses_course" ADD CONSTRAINT "FK_d8e718fbdea73702563e6cfecb2" FOREIGN KEY ("professorId") REFERENCES "professor"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "professor_courses_course" ADD CONSTRAINT "FK_6eb199629534b22f498dec9567e" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "student_courses_course" ADD CONSTRAINT "FK_29e49d9ad51ffb927f488f0802e" FOREIGN KEY ("studentId") REFERENCES "student"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "student_courses_course" ADD CONSTRAINT "FK_d13666d470035a399961e1d08cb" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "DEPARTMENT_COURSES" ADD CONSTRAINT "FK_e6c478cfd1402822df7b5e25689" FOREIGN KEY ("departmentsId") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "DEPARTMENT_COURSES" ADD CONSTRAINT "FK_965801c63747a7f8dc0570e6e49" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "DEPARTMENT_COURSES" DROP CONSTRAINT "FK_965801c63747a7f8dc0570e6e49"`
        );
        await queryRunner.query(
            `ALTER TABLE "DEPARTMENT_COURSES" DROP CONSTRAINT "FK_e6c478cfd1402822df7b5e25689"`
        );
        await queryRunner.query(
            `ALTER TABLE "student_courses_course" DROP CONSTRAINT "FK_d13666d470035a399961e1d08cb"`
        );
        await queryRunner.query(
            `ALTER TABLE "student_courses_course" DROP CONSTRAINT "FK_29e49d9ad51ffb927f488f0802e"`
        );
        await queryRunner.query(
            `ALTER TABLE "professor_courses_course" DROP CONSTRAINT "FK_6eb199629534b22f498dec9567e"`
        );
        await queryRunner.query(
            `ALTER TABLE "professor_courses_course" DROP CONSTRAINT "FK_d8e718fbdea73702563e6cfecb2"`
        );
        await queryRunner.query(
            `ALTER TABLE "course" DROP CONSTRAINT "FK_254eaf1f4ac5c87bd1ebc2efce3"`
        );
        await queryRunner.query(
            `ALTER TABLE "departments" DROP CONSTRAINT "FK_334b23b781f57a4113bd0eef86d"`
        );
        await queryRunner.query(
            `ALTER TABLE "departments" DROP CONSTRAINT "FK_16d3333406d0e7b64b95d51d22e"`
        );
        await queryRunner.query(
            `ALTER TABLE "exam" DROP CONSTRAINT "FK_d13e02e30e86bbf25e5e3e7bee8"`
        );
        await queryRunner.query(
            `ALTER TABLE "exam" DROP CONSTRAINT "FK_e6b0d68b26f7847f2d46810df8f"`
        );
        await queryRunner.query(
            `ALTER TABLE "students_exams" DROP CONSTRAINT "FK_0c9ec9dd610ce25a3896ab580e0"`
        );
        await queryRunner.query(
            `ALTER TABLE "students_exams" DROP CONSTRAINT "FK_ae4d89d9a5da2b3d43a65ae0b07"`
        );
        await queryRunner.query(
            `ALTER TABLE "student" DROP CONSTRAINT "FK_e37af156fe109a0c491a40afe29"`
        );
        await queryRunner.query(
            `ALTER TABLE "student" DROP CONSTRAINT "FK_5055e57181dc1d5ff6f4da7a98c"`
        );
        await queryRunner.query(
            `ALTER TABLE "report" DROP CONSTRAINT "FK_43ee63268434d93f7896a50f308"`
        );
        await queryRunner.query(
            `ALTER TABLE "report" DROP CONSTRAINT "FK_43eef8080ece60ccb041dd31809"`
        );
        await queryRunner.query(
            `ALTER TABLE "student_lecture_attendance" DROP CONSTRAINT "FK_52753ba2926a7e545d9827ba873"`
        );
        await queryRunner.query(
            `ALTER TABLE "student_lecture_attendance" DROP CONSTRAINT "FK_e78ee3aed41d963a3a9fd4079c2"`
        );
        await queryRunner.query(
            `ALTER TABLE "lecture" DROP CONSTRAINT "FK_137552ffd78c2368c74ccf19de6"`
        );
        await queryRunner.query(
            `ALTER TABLE "lecture" DROP CONSTRAINT "FK_89e61e55d5b02ea76363a3a55a6"`
        );
        await queryRunner.query(
            `ALTER TABLE "professor" DROP CONSTRAINT "FK_7e281a085f2314de20f6a62fe41"`
        );
        await queryRunner.query(`DROP INDEX "IDX_965801c63747a7f8dc0570e6e4"`);
        await queryRunner.query(`DROP INDEX "IDX_e6c478cfd1402822df7b5e2568"`);
        await queryRunner.query(`DROP TABLE "DEPARTMENT_COURSES"`);
        await queryRunner.query(`DROP INDEX "IDX_d13666d470035a399961e1d08c"`);
        await queryRunner.query(`DROP INDEX "IDX_29e49d9ad51ffb927f488f0802"`);
        await queryRunner.query(`DROP TABLE "student_courses_course"`);
        await queryRunner.query(`DROP INDEX "IDX_6eb199629534b22f498dec9567"`);
        await queryRunner.query(`DROP INDEX "IDX_d8e718fbdea73702563e6cfecb"`);
        await queryRunner.query(`DROP TABLE "professor_courses_course"`);
        await queryRunner.query(`DROP TABLE "admin"`);
        await queryRunner.query(`DROP TABLE "course"`);
        await queryRunner.query(`DROP TABLE "departments"`);
        await queryRunner.query(`DROP TABLE "exam"`);
        await queryRunner.query(`DROP TABLE "students_exams"`);
        await queryRunner.query(`DROP TABLE "student"`);
        await queryRunner.query(`DROP TABLE "embedding"`);
        await queryRunner.query(`DROP TABLE "report"`);
        await queryRunner.query(`DROP TABLE "student_lecture_attendance"`);
        await queryRunner.query(`DROP TABLE "lecture"`);
        await queryRunner.query(`DROP TABLE "professor"`);
    }
}
