import passport, { BlockedJWTMiddleware } from "@services/Auth";
import { Router } from "express";
import BodyParserMiddleware from "@services/Routes/BodyParserMiddleware/BodyParserMiddleware";
import ExamParser, {
    ExamRequest,
} from "@services/Routes/BodyParserMiddleware/ExamParser";
import ExamsLogic from "@controller/BusinessLogic/Event/Exam/exam-logic";
import ExamsLogicImpl from "@controller/BusinessLogic/Event/Exam/exam-logic-impl";
import simpleFinalMWDecorator from "@services/utils/RequestDecorator";
import multer from "multer";
import { onlyStudents } from "@services/Routes/User/AuthorizationMiddleware";
import {
    ExamChunkResultCallback,
    ExamFileInfo,
    sendExamFile,
    sendInitialVideo,
} from "@controller/sending/sendFiles";
import { randomInt } from "crypto";
import StudentLogicImpl from "@controller/BusinessLogic/User/Student/students-logic-impl";
import StudentLogic from "@controller/BusinessLogic/User/Student/students-logic";
import Embedding from "@models/Users/Embedding";
import ReportLogic from "@controller/BusinessLogic/Report/report-logic";
import { ReportLogicImpl } from "@controller/BusinessLogic/Report/report-logic-impl";

const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");

const router = Router();

router.use(BlockedJWTMiddleware);
router.use(passport.authenticate("access-token", { session: false }));

const parser: BodyParserMiddleware = new ExamParser();

var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

/**
 * save exam recording
 * 
 * req body must contain
 * - usedId 
 * - examId
 * - chunckIndex : number of current chunk
 * - chuck : actual recorded chunk in webm format
 // TODO add parser to validate the exam info fields
 */
router.put(
    "/record",
    onlyStudents,
    upload.single("chuck"),
    async (req, res) => {
        simpleFinalMWDecorator(res, async () => {
            const logic: ExamsLogic = new ExamsLogicImpl();

            // TODO we may only save when there is problem

            // TODO
            // * send to ML
            const fileInfo: ExamFileInfo = {
                examId: req.body.examId,
                chunkIndex: req.body.chunckIndex,
                lastChunk: req.body.lastChunk,
                chunk: req.file.buffer,
                chunkStartTime: req.body.chunkStartTime,
                chunkEndTime: req.body.chunkEndTime,
            };

            // save recived chunk
            const filePath = await logic.saveRecording(
                fileInfo.chunk as Buffer,
                fileInfo.examId,
                req.body.userId,
                fileInfo.chunkIndex
            );

            // get playaple buffer of last chunk
            ffmpeg.setFfmpegPath(ffmpegPath);

            const randNum = Date.now() + req.body.userId;
            const chunkPath = `/tmp/chunk_${randNum}.mkv`;

            const send_file = async () => {
                const result_callback: ExamChunkResultCallback = async (
                    userId: string,
                    examId: string,
                    res: string,
                    chunkStartTime: number,
                    chunkEndTime: number
                ) => {
                    const matching = res;
                    console.log(matching);

                    if (!matching) {
                        // TODO save database
                        console.log("will save");
                        const reportlogic: ReportLogic = new ReportLogicImpl();
                        reportlogic.addToReport(
                            userId,
                            examId,
                            chunkStartTime,
                            chunkEndTime - chunkStartTime
                        );
                        console.log(chunkStartTime);
                        console.log(res);
                    }
                };

                // send the file and delete it
                const serverBaseUrl = `${process.env.ML_SO_IO_SERVER_BASE_D}:${process.env.ML_SO_IO_SERVER_PORT}`;

                const studentLogic: StudentLogic = new StudentLogicImpl();

                const embedding: Embedding = await studentLogic.getEmbedding(
                    req.body.userId
                );

                sendExamFile(
                    req.body.userId,
                    serverBaseUrl,
                    fileInfo,
                    chunkPath,
                    embedding,
                    result_callback
                );
                // * save time stamp if not match
            };

            ffmpeg(filePath)
                .setStartTime(fileInfo.chunkStartTime)
                .setDuration(10)
                .output(chunkPath)
                .videoCodec("copy")
                .audioCodec("copy")
                .on("end", async function (err: any) {
                    if (!err) {
                        console.log("conversion Done");
                        await send_file();
                    }
                })
                .on("error", function (err: any) {
                    console.log("error: ", err);
                })
                .run();

            // TODO delete the file
        });
    }
);

router.get("/report", async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: ReportLogic = new ReportLogicImpl();
        const report = logic.getReport(req.body.studentId, req.body.examId);

        return report;
    });
});
router.get("/:examId", async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: ExamsLogic = new ExamsLogicImpl();
        const exam = await logic.getExamById(req.params.examId);
        return exam;
    });
});

router.get("/", async (req, res) => {
    const year = req.body.year;
    if (!year || !parseInt(year))
        res.status(400).send({ success: false, message: "Invalid year" });
    simpleFinalMWDecorator(res, async () => {
        const logic: ExamsLogic = new ExamsLogicImpl();
        const exams = await logic.getExamsByYear(year);
        return exams;
    });
});

router.post("/", parser.completeParser, async (req, res) => {
    simpleFinalMWDecorator(
        res,
        async () => {
            const logic: ExamsLogic = new ExamsLogicImpl();
            const examReq = req as ExamRequest;
            const exam = await logic.createExam(examReq.exam);
            return exam;
        },
        201
    );
});

router.put("/:examId", parser.completeParser, async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: ExamsLogic = new ExamsLogicImpl();
        const examReq = req as ExamRequest;
        const exam = await logic.updateExam(req.params.examId, examReq.exam);
        return exam;
    });
});

router.patch("/:examId", parser.partialParser, async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: ExamsLogic = new ExamsLogicImpl();
        const examReq = req as ExamRequest;
        const exam = await logic.updateExam(req.params.examId, examReq.exam);
        return exam;
    });
});

router.delete("/:examId", async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: ExamsLogic = new ExamsLogicImpl();
        await logic.deleteExamById(req.params.examId);
    });
});

export default router;
