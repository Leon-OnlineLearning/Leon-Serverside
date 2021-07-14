import {
    ExamChunkResultCallback,
    sendExamFile,
    StorageCallback,
} from "@controller/sending/sendFiles";
import express from "express";
import { Server } from "http";
import multer from "multer";
import fs from "fs";
import Embedding from "@models/Users/Embedding";

describe("Sending video with http POST method", () => {
    let app: express.Application, server: Server, uploader: multer.Multer;
    beforeAll((done) => {
        app = express();
        uploader = multer();
        server = app.listen(6770, () => {
            console.log("testing server started at http://localhost:6770");
            done();
        });
    });

    afterAll((done) => {
        server.close(() => {
            done();
        });
    });

    test("it should send video successfully", (done) => {
        const userId = "usrId";
        const examId = "examId";
        let numberCalled = 0;
        app.post("/exams/:user_id", uploader.single("chunk"), (req, res) => {
            numberCalled++;
            expect(req.file).toBeTruthy();
            expect(req.params["user_id"]).toEqual(userId);
            res.json({ matched: 1 });
        });
        const startTime = 0;
        const endTime = 10;

        const resultCallback: ExamChunkResultCallback = async (
            usrId,
            examId,
            result,
            startDate,
            endDate
        ) => {
            expect(result)
            done();
        };

        const storageCallback: StorageCallback = async (
            chunk,
            examId,
            userId
        ) => {
            expect(chunk).toBeTruthy();
        };

        sendExamFile(
            userId,
            "http://localhost:6770",
            {
                chunk: fs.readFileSync(__dirname + "/videoTst.webm"),
                chunkEndTime: endTime,
                chunkStartTime: startTime,
                chunkIndex: 1,
                examId,
                lastChunk: false,
            },
            __dirname + "/videoTst.webm",
            resultCallback,
            new Embedding(),
        );

        sendExamFile(
            userId,
            "http://localhost:6770",
            {
                chunk: fs.readFileSync(__dirname + "/videoTst.webm"),
                chunkEndTime: endTime,
                chunkStartTime: startTime,
                chunkIndex: 2,
                examId,
                lastChunk: false,
            },
            __dirname + "/videoTst.webm",
            resultCallback,
            new Embedding(),
        );
    });
});
