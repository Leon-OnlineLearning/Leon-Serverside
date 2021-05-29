import passport, {
    accessTokenValidationMiddleware,
    BlockedJWTMiddleware,
} from "@services/Auth";
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
import { report_res } from "./send_utils";

const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");

const router = Router();

router.use(BlockedJWTMiddleware);
// router.use(passport.authenticate("access-token", { session: false }));
router.use(accessTokenValidationMiddleware);

const parser: BodyParserMiddleware = new ExamParser();

var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

const serverBaseUrl = `${process.env.ML_SO_IO_SERVER_BASE_D}:${process.env.ML_SO_IO_SERVER_PORT}`;

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

            const embedding: Embedding = await new StudentLogicImpl().getEmbedding(
                req.body.userId
            );
            if (!embedding?.vector) {
                throw new Error("no embedding for student");
            }
            // get playaple buffer of last chunk
            ffmpeg.setFfmpegPath(ffmpegPath);

            const randNum = Date.now() + req.body.userId;
            const chunkPath = `/tmp/chunk_${randNum}.mkv`;

            ffmpeg(filePath)
                .setStartTime(fileInfo.chunkStartTime)
                .setDuration(10)
                .output(chunkPath)
                .videoCodec("copy")
                .audioCodec("copy")
                .on("end", async function (err: any) {
                    if (!err) {
                        console.log("conversion Done");
                        await sendExamFile(
                            req.body.userId,
                            serverBaseUrl,
                            fileInfo,
                            chunkPath,
                            embedding,
                            report_res
                        );
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
        
        // sanity check
        if (!req.query.userId)
            throw new Error("request must contain userId");
        if (!req.query.examId)
            throw new Error("request must contain examId");
        
        const studentId = req.query.userId as string
        const examId = req.query.examId as string
        const report = await logic.getReport(studentId, examId);
        console.debug(`sending ${report.length} reports` )

        return report;
    });
});

router.get("/student/:studentId", onlyStudents, async (req, res) => {
    const studentId = req.params.studentId;
    console.debug(`get exams for user ${studentId}`);
    simpleFinalMWDecorator(res, async () => {
        const examLogic: ExamsLogic = new ExamsLogicImpl();
        const exams = await examLogic.getExamByStudentId(studentId);
        console.debug(`availabe exams ${exams.length}`);
        return exams;
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
