import { sendInitialVideo } from "@controller/sending/sendFiles";
import express, { Application } from "express";
import { Server } from "http";
import multer from "multer";
import fs from "fs";
import StudentLogic from "@controller/BusinessLogic/User/Student/students-logic";
import StudentLogicImpl from "@controller/BusinessLogic/User/Student/students-logic-impl";
import Student from "@models/Users/Student";
import {
    destructDBMSConnection,
    initializeDBMSConnection,
} from "@utils/database-connection";
describe("Uploading video and recording embeddings", () => {
    let app: Application, server: Server, uploader: multer.Multer;
    beforeAll((done) => {
        app = express();
        uploader = multer();
        server = app.listen(6790, () => {
            console.log("testing server started at http://localhost:6790");
        });
        initializeDBMSConnection().then(() => {
            done();
        });
    });

    afterAll((done) => {
        server.close(() => {});
        destructDBMSConnection().then(() => {
            done();
        });
    });

    test("should send video to ml server and record the resulting embedding", async () => {
        try {
            const embeddingRes = {
                embedding: [0.012345678, 2.012345678, 3.12345, 4.789456, 5.01],
            };
            const studentLogic: StudentLogic = new StudentLogicImpl();
            let student = new Student();
            student.firstName = "ahmed";
            student.lastName = "whaever";
            student.email = `dakjdksaj${Date.now()}`;
            student.password = "d@Eqwdsa54878";
            student = await studentLogic.createStudent(student);

            app.post("/users", uploader.single("student_video"), (req, res) => {
                expect(req.file).toBeTruthy();
                res.json(embeddingRes);
            });

            // 1- copy the file
            fs.copyFileSync(
                __dirname + "/../../unit/SendExamVideo/videoTst.webm",
                __dirname + "/../../unit/SendExamVideo/videoTstC.webm"
            );
            // use the new copied file to get the buffer

            await sendInitialVideo(
                fs.readFileSync(
                    __dirname + "/../../unit/SendExamVideo/videoTstC.webm"
                ),
                student.id,
                "http://localhost:6790",
                studentLogic.setEmbedding,
            );
            const embedding = await studentLogic.getEmbedding(student.id);
            expect(embedding.vector).toEqual(embeddingRes.embedding);
        } catch (e) {
            console.log(e);
            expect(0).toEqual(1);
        }
    });
});
