import { MigrationInterface, QueryRunner } from "typeorm";

export class separateTestSentenceAndTestFile1625576017397
    implements MigrationInterface {
    name = "separateTestSentenceAndTestFile1625576017397";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "course" DROP COLUMN "lastTestResults"`
        );
        await queryRunner.query(
            `ALTER TABLE "course" ADD "lastSentenceTestResults" jsonb`
        );
        await queryRunner.query(
            `ALTER TABLE "course" ADD "lastFileTestResults" jsonb`
        );
        await queryRunner.query(
            `ALTER TABLE "lecture" DROP CONSTRAINT "FK_66f7eafc7dc5fcb5629d4c7c028"`
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "audio_room"."roomId" IS NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "audio_room" ADD CONSTRAINT "UQ_5900c2876471c047859a5629ed0" UNIQUE ("roomId")`
        );
        await queryRunner.query(
            `ALTER TABLE "embedding" ALTER COLUMN "vector" TYPE numeric(21,20) array`
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "embedding"."vector" IS NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "lecture" ADD CONSTRAINT "FK_66f7eafc7dc5fcb5629d4c7c028" FOREIGN KEY ("liveRoomRoomId") REFERENCES "audio_room"("roomId") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "lecture" DROP CONSTRAINT "FK_66f7eafc7dc5fcb5629d4c7c028"`
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "embedding"."vector" IS NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "embedding" ALTER COLUMN "vector" TYPE numeric array`
        );
        await queryRunner.query(
            `ALTER TABLE "audio_room" DROP CONSTRAINT "UQ_5900c2876471c047859a5629ed0"`
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "audio_room"."roomId" IS NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "lecture" ADD CONSTRAINT "FK_66f7eafc7dc5fcb5629d4c7c028" FOREIGN KEY ("liveRoomRoomId") REFERENCES "audio_room"("roomId") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "course" DROP COLUMN "lastFileTestResults"`
        );
        await queryRunner.query(
            `ALTER TABLE "course" DROP COLUMN "lastSentenceTestResults"`
        );
        await queryRunner.query(
            `ALTER TABLE "course" ADD "lastTestResults" jsonb`
        );
    }
}
