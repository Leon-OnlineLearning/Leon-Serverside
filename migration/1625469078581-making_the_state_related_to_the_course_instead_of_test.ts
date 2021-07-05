import {MigrationInterface, QueryRunner} from "typeorm";

export class makingTheStateRelatedToTheCourseInsteadOfTest1625469078581 implements MigrationInterface {
    name = 'makingTheStateRelatedToTheCourseInsteadOfTest1625469078581'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "testingState" TO "connectionState"`);
        await queryRunner.query(`ALTER TYPE "public"."course_testingstate_enum" RENAME TO "course_connectionstate_enum"`);
        await queryRunner.query(`CREATE TABLE "audio_room" ("roomId" SERIAL NOT NULL, "roomSecret" uuid NOT NULL DEFAULT uuid_generate_v4(), "isAlive" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_5900c2876471c047859a5629ed0" UNIQUE ("roomId"), CONSTRAINT "PK_5900c2876471c047859a5629ed0" PRIMARY KEY ("roomId"))`);
        await queryRunner.query(`ALTER TABLE "text_classification_model" DROP COLUMN "accuracy"`);
        await queryRunner.query(`ALTER TABLE "lecture" ADD "liveRoomRoomId" integer`);
        await queryRunner.query(`ALTER TABLE "lecture" ADD CONSTRAINT "UQ_66f7eafc7dc5fcb5629d4c7c028" UNIQUE ("liveRoomRoomId")`);
        await queryRunner.query(`ALTER TABLE "embedding" ALTER COLUMN "vector" TYPE numeric(21,20) array`);
        await queryRunner.query(`COMMENT ON COLUMN "embedding"."vector" IS NULL`);
        await queryRunner.query(`ALTER TABLE "lecture" ADD CONSTRAINT "FK_66f7eafc7dc5fcb5629d4c7c028" FOREIGN KEY ("liveRoomRoomId") REFERENCES "audio_room"("roomId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lecture" DROP CONSTRAINT "FK_66f7eafc7dc5fcb5629d4c7c028"`);
        await queryRunner.query(`COMMENT ON COLUMN "embedding"."vector" IS NULL`);
        await queryRunner.query(`ALTER TABLE "embedding" ALTER COLUMN "vector" TYPE numeric array`);
        await queryRunner.query(`ALTER TABLE "lecture" DROP CONSTRAINT "UQ_66f7eafc7dc5fcb5629d4c7c028"`);
        await queryRunner.query(`ALTER TABLE "lecture" DROP COLUMN "liveRoomRoomId"`);
        await queryRunner.query(`ALTER TABLE "text_classification_model" ADD "accuracy" numeric(21,20)`);
        await queryRunner.query(`DROP TABLE "audio_room"`);
        await queryRunner.query(`ALTER TYPE "course_connectionstate_enum" RENAME TO "course_testingstate_enum"`);
        await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "connectionState" TO "testingState"`);
    }

}
