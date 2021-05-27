import {MigrationInterface, QueryRunner} from "typeorm";

export class textClassificaiton1622119600861 implements MigrationInterface {
    name = 'textClassificaiton1622119600861'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "departments" DROP CONSTRAINT "FK_7a85f6aad0911614c11aa710053"`);
        await queryRunner.query(`ALTER TABLE "course" DROP CONSTRAINT "FK_62bd85cf9a50b5dff651935e028"`);
        await queryRunner.query(`CREATE TABLE "exam_question" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "questionType" character varying NOT NULL, "questionText" character varying NOT NULL, "fig_url" character varying, "choices" text array, "code_lang" character varying, "examId" uuid, CONSTRAINT "PK_a1c309a024492d50f43ff8b4c67" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "text_classification_model" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "accuracy" character varying, "predictionModelPath" character varying, "rasingModelPath" character varying, "dataLanguageModelPath" character varying, "dataClassificationModelPath" character varying, "courseId" uuid, "superModuleId" uuid, CONSTRAINT "PK_538467ed552a09c34a14eeb2d48" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "embedding" ALTER COLUMN "vector" TYPE numeric(21,20) array`);
        await queryRunner.query(`COMMENT ON COLUMN "embedding"."vector" IS NULL`);
        await queryRunner.query(`ALTER TABLE "exam_question" ADD CONSTRAINT "FK_63d8bcbf00bf0267ba18888c893" FOREIGN KEY ("examId") REFERENCES "exam"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "departments" ADD CONSTRAINT "FK_7a85f6aad0911614c11aa710053" FOREIGN KEY ("coursesId") REFERENCES "course"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "text_classification_model" ADD CONSTRAINT "FK_4a380d6fccb21e4915f27d519a0" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "text_classification_model" ADD CONSTRAINT "FK_8f5c7a1b67b0ed3446afaa50d22" FOREIGN KEY ("superModuleId") REFERENCES "text_classification_model"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "course" ADD CONSTRAINT "FK_62bd85cf9a50b5dff651935e028" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course" DROP CONSTRAINT "FK_62bd85cf9a50b5dff651935e028"`);
        await queryRunner.query(`ALTER TABLE "text_classification_model" DROP CONSTRAINT "FK_8f5c7a1b67b0ed3446afaa50d22"`);
        await queryRunner.query(`ALTER TABLE "text_classification_model" DROP CONSTRAINT "FK_4a380d6fccb21e4915f27d519a0"`);
        await queryRunner.query(`ALTER TABLE "departments" DROP CONSTRAINT "FK_7a85f6aad0911614c11aa710053"`);
        await queryRunner.query(`ALTER TABLE "exam_question" DROP CONSTRAINT "FK_63d8bcbf00bf0267ba18888c893"`);
        await queryRunner.query(`COMMENT ON COLUMN "embedding"."vector" IS NULL`);
        await queryRunner.query(`ALTER TABLE "embedding" ALTER COLUMN "vector" TYPE numeric array`);
        await queryRunner.query(`DROP TABLE "text_classification_model"`);
        await queryRunner.query(`DROP TABLE "exam_question"`);
        await queryRunner.query(`ALTER TABLE "course" ADD CONSTRAINT "FK_62bd85cf9a50b5dff651935e028" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "departments" ADD CONSTRAINT "FK_7a85f6aad0911614c11aa710053" FOREIGN KEY ("coursesId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
