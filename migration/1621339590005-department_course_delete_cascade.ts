import { MigrationInterface, QueryRunner } from "typeorm";

export class departmentCourseDeleteCascade1621339590005
    implements MigrationInterface {
    name = "departmentCourseDeleteCascade1621339590005";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "departments" DROP CONSTRAINT "FK_7a85f6aad0911614c11aa710053"`
        );
        await queryRunner.query(
            `ALTER TABLE "embedding" ALTER COLUMN "vector" TYPE numeric(21,20) array`
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "embedding"."vector" IS NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "departments" ADD CONSTRAINT "FK_7a85f6aad0911614c11aa710053" FOREIGN KEY ("coursesId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
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
            `ALTER TABLE "departments" ADD CONSTRAINT "FK_7a85f6aad0911614c11aa710053" FOREIGN KEY ("coursesId") REFERENCES "course"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
    }
}
