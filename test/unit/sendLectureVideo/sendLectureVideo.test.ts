import express from "express";
import { Server } from "http";
import { sendLectureVideo } from "@controller/sending/sendFiles";
import fs from "fs";
import multer from "multer";

describe("sending videos to lectures server", () => {
    let lectureIdIsCorrect = false;
    const LECTURE_ID = "lectureID";
    let videoFileNameCorrect = false;

    let app: express.Application, server: Server, uploader: multer.Multer;
    beforeAll((done) => {
        app = express();
        uploader = multer();
        server = app.listen(6788, () => {
            console.log("testing server started at http://localhost:6789");
            done();
        });
    });

    afterAll((done) => {
        server.close(() => {
            done();
        });
    });

    test("should send videos successfully", async () => {
        app.post("/video", uploader.single("lecture_video"), (req, res) => {
            expect(req.file).toBeTruthy();
            expect(req.file.originalname).toEqual(
                `lectureVideo-${LECTURE_ID}.webm`
            );
            expect(req.body.lectureId).toEqual(LECTURE_ID);
            res.json({ success: true });
        });

        try {
            await sendLectureVideo(
                fs.readFileSync(__dirname + "/videoTst.webm"),
                LECTURE_ID,
                async (res) => {
                    console.log(res);
                },
                "http://localhost:6788/video"
            );
        } catch (e) {
            expect(true).toBeFalsy();
        }
    });
});
