import { MigrationInterface, QueryRunner } from "typeorm";

export class addSessionAndFileInfo1622823279399 implements MigrationInterface {
    name = "addSessionAndFileInfo1622823279399";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "text_classification_model_file" DROP CONSTRAINT "FK_81449a7bcfd92c0e6e3f601131d"`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model_file" DROP CONSTRAINT "FK_4038d735da3b0428eeb5bf965b8"`
        );
        await queryRunner.query(
            `CREATE TABLE "lecture_transcript" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "filePath" character varying NOT NULL, CONSTRAINT "PK_9fe42518501989049ce61f91845" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_file" DROP COLUMN "fileType"`
        );
        await queryRunner.query(
            `DROP TYPE "public"."text_classification_file_filetype_enum"`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model_file" DROP COLUMN "related"`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model_file" DROP CONSTRAINT "PK_aeca0f595268cd0382cb64bb3e1"`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model_file" ADD CONSTRAINT "PK_4038d735da3b0428eeb5bf965b8" PRIMARY KEY ("fileId")`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model_file" DROP COLUMN "modelId"`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model_file" DROP CONSTRAINT "PK_4038d735da3b0428eeb5bf965b8"`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model_file" DROP COLUMN "fileId"`
        );
        await queryRunner.query(
            `ALTER TABLE "professor" ADD "sessionId" character varying`
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "professor"."sessionId" IS 'session id is the model id'`
        );
        await queryRunner.query(
            `ALTER TABLE "lecture" ADD "transcriptId" uuid`
        );
        await queryRunner.query(
            `ALTER TABLE "lecture" ADD CONSTRAINT "UQ_bf30f67bfe1e569c7b5f7749ce0" UNIQUE ("transcriptId")`
        );
        await queryRunner.query(
            `CREATE TYPE "text_classification_model_file_file_relation_enum" AS ENUM('related', 'non-related', 'test')`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model_file" ADD "file_relation" "text_classification_model_file_file_relation_enum" NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model_file" ADD "model_id" uuid NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model_file" ADD CONSTRAINT "PK_aec9ba3a1f63bc5b98bb09e633a" PRIMARY KEY ("model_id")`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model_file" ADD "file_id" uuid NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model_file" DROP CONSTRAINT "PK_aec9ba3a1f63bc5b98bb09e633a"`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model_file" ADD CONSTRAINT "PK_3165b642f8ea9f1b166d2b8589e" PRIMARY KEY ("model_id", "file_id")`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`
        );
        await queryRunner.query(
            `ALTER TABLE "embedding" ALTER COLUMN "vector" TYPE numeric(21,20) array`
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "embedding"."vector" IS NULL`
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "text_classification_model_file"."className" IS NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model_file" ALTER COLUMN "className" SET DEFAULT 'testing'`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model" DROP COLUMN "accuracy"`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model" ADD "accuracy" integer`
        );
        await queryRunner.query(
            `ALTER TABLE "lecture" ADD CONSTRAINT "FK_bf30f67bfe1e569c7b5f7749ce0" FOREIGN KEY ("transcriptId") REFERENCES "lecture_transcript"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model_file" ADD CONSTRAINT "FK_aec9ba3a1f63bc5b98bb09e633a" FOREIGN KEY ("model_id") REFERENCES "text_classification_model"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model_file" ADD CONSTRAINT "FK_0194bc08aaa890be44a66abea2f" FOREIGN KEY ("file_id") REFERENCES "text_classification_file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "text_classification_model_file" DROP CONSTRAINT "FK_0194bc08aaa890be44a66abea2f"`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model_file" DROP CONSTRAINT "FK_aec9ba3a1f63bc5b98bb09e633a"`
        );
        await queryRunner.query(
            `ALTER TABLE "lecture" DROP CONSTRAINT "FK_bf30f67bfe1e569c7b5f7749ce0"`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model" DROP COLUMN "accuracy"`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model" ADD "accuracy" character varying`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model_file" ALTER COLUMN "className" DROP DEFAULT`
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "text_classification_model_file"."className" IS NULL`
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "embedding"."vector" IS NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "embedding" ALTER COLUMN "vector" TYPE numeric array`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model" DROP COLUMN "createdAt"`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model_file" DROP CONSTRAINT "PK_3165b642f8ea9f1b166d2b8589e"`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model_file" ADD CONSTRAINT "PK_aec9ba3a1f63bc5b98bb09e633a" PRIMARY KEY ("model_id")`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model_file" DROP COLUMN "file_id"`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model_file" DROP CONSTRAINT "PK_aec9ba3a1f63bc5b98bb09e633a"`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model_file" DROP COLUMN "model_id"`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model_file" DROP COLUMN "file_relation"`
        );
        await queryRunner.query(
            `DROP TYPE "text_classification_model_file_file_relation_enum"`
        );
        await queryRunner.query(
            `ALTER TABLE "lecture" DROP CONSTRAINT "UQ_bf30f67bfe1e569c7b5f7749ce0"`
        );
        await queryRunner.query(
            `ALTER TABLE "lecture" DROP COLUMN "transcriptId"`
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "professor"."sessionId" IS 'session id is the model id'`
        );
        await queryRunner.query(
            `ALTER TABLE "professor" DROP COLUMN "sessionId"`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model_file" ADD "fileId" uuid NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model_file" ADD CONSTRAINT "PK_4038d735da3b0428eeb5bf965b8" PRIMARY KEY ("fileId")`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model_file" ADD "modelId" uuid NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model_file" DROP CONSTRAINT "PK_4038d735da3b0428eeb5bf965b8"`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model_file" ADD CONSTRAINT "PK_aeca0f595268cd0382cb64bb3e1" PRIMARY KEY ("modelId", "fileId")`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model_file" ADD "related" boolean NOT NULL`
        );
        await queryRunner.query(
            `CREATE TYPE "public"."text_classification_file_filetype_enum" AS ENUM('related', 'non-related')`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_file" ADD "fileType" "text_classification_file_filetype_enum" NOT NULL`
        );
        await queryRunner.query(`DROP TABLE "lecture_transcript"`);
        await queryRunner.query(
            `ALTER TABLE "text_classification_model_file" ADD CONSTRAINT "FK_4038d735da3b0428eeb5bf965b8" FOREIGN KEY ("fileId") REFERENCES "text_classification_file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "text_classification_model_file" ADD CONSTRAINT "FK_81449a7bcfd92c0e6e3f601131d" FOREIGN KEY ("modelId") REFERENCES "text_classification_model"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
    }
}
