import { MigrationInterface, QueryRunner } from "typeorm";

export class addYearToCourse1620394498085 implements MigrationInterface {
    name = "addYearToCourse1620394498085";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "course" DROP CONSTRAINT "FK_254eaf1f4ac5c87bd1ebc2efce3"`
        );
        await queryRunner.query(
            `ALTER TABLE "course" DROP COLUMN "departmentsId"`
        );
        await queryRunner.query(
            `ALTER TABLE "departments" ADD "coursesId" uuid`
        );
        await queryRunner.query(
            `ALTER TABLE "course" ADD "year" integer NOT NULL`
        );
        await queryRunner.query(`ALTER TABLE "course" ADD "departmentId" uuid`);
        await queryRunner.query(
            `ALTER TABLE "embedding" ALTER COLUMN "vector" TYPE numeric(21,20) array`
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "embedding"."vector" IS NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "departments" ADD CONSTRAINT "FK_7a85f6aad0911614c11aa710053" FOREIGN KEY ("coursesId") REFERENCES "course"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "course" ADD CONSTRAINT "FK_62bd85cf9a50b5dff651935e028" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "course" DROP CONSTRAINT "FK_62bd85cf9a50b5dff651935e028"`
        );
        await queryRunner.query(
            `ALTER TABLE "departments" DROP CONSTRAINT "FK_7a85f6aad0911614c11aa710053"`
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "embedding"."vector" IS NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "embedding" ALTER COLUMN "vector" TYPE numeric array`
        );
        await queryRunner.query(
            `ALTER TABLE "course" DROP COLUMN "departmentId"`
        );
        await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "year"`);
        await queryRunner.query(
            `ALTER TABLE "departments" DROP COLUMN "coursesId"`
        );
        await queryRunner.query(
            `ALTER TABLE "course" ADD "departmentsId" uuid`
        );
        await queryRunner.query(
            `ALTER TABLE "course" ADD CONSTRAINT "FK_254eaf1f4ac5c87bd1ebc2efce3" FOREIGN KEY ("departmentsId") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
    }
}
