import {
  ResultCallback,
  sendFileHttpMethods,
  StorageCallback,
} from "@controller/sending/sendFiles";
import express from "express";
import { Server } from "http";
import multer from "multer";
import fs from "fs";

describe("Sending video with http POST method", () => {
  let app: express.Application, server: Server, uploader: multer.Multer;
  beforeAll((done) => {
    app = express();
    uploader = multer();
    server = app.listen(6789, () => {
      console.log("testing server started at http://localhost:6789");
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
      res.json(1);
    });
    const startTime = new Date();
    let endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + 5);

    const resultCallback: ResultCallback = async (
      result,
      startDate,
      endDate
    ) => {
      expect(result).toEqual(1);
      expect(numberCalled).toEqual(1);
      done();
    };

    const storageCallback: StorageCallback = async (chunk, examId, userId) => {
      expect(chunk).toBeTruthy();
    };

    sendFileHttpMethods(
      userId,
      "http://localhost:6789",
      {
        chunk: fs.createReadStream(__dirname + "/videoTst.webm"),
        chunkEndTime: endTime,
        chunkStartTime: startTime,
        chunkIndex: 1,
        examId,
        lastChunk: false,
      },
      storageCallback,
      resultCallback
    );

    sendFileHttpMethods(
      userId,
      "http://localhost:6789",
      {
        chunk: fs.createReadStream(__dirname + "/videoTst.webm"),
        chunkEndTime: endTime,
        chunkStartTime: startTime,
        chunkIndex: 2,
        examId,
        lastChunk: false,
      },
      storageCallback,
      resultCallback
    );
  });
});
