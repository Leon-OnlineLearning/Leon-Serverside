import passport, {
    accessTokenValidationMiddleware,
    BlockedJWTMiddleware,
} from "@services/Auth";
import { Router } from "express";
import BodyParserMiddleware from "@services/Routes/BodyParserMiddleware/BodyParserMiddleware";
import ExamParser, {
    answerParser,
    ExamRequest,
    getQuestionParser,
    NextQuestionRequest,
    QuestionRequest,
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
} from "@controller/sending/sendFiles";
import { randomInt } from "crypto";
import StudentLogicImpl from "@controller/BusinessLogic/User/Student/students-logic-impl";
import StudentLogic from "@controller/BusinessLogic/User/Student/students-logic";
import Embedding from "@models/Users/Embedding";
import ReportLogic from "@controller/BusinessLogic/Report/report-logic";
import { ReportLogicImpl } from "@controller/BusinessLogic/Report/report-logic-impl";
import {
    get_video_path,
    get_video_portion,
    report_not_live,
    report_res_face_auth,
    report_res_forbidden_objects,
} from "./recording_utils";

import fs from "fs";
import NodeCache from "node-cache";
import QuestionLogicImpl from "@controller/BusinessLogic/Event/Exam/question-logic-impl";

const videoCache = new NodeCache({ stdTTL: 60 * 60 });
videoCache.on("del", (key, val) => {
    console.debug(`deleting cached file ${val}`);
    fs.unlink(val, console.error);
    // TODO test if this work
});
const cacheKey = (filePath: string, StartTime: number, duration: number) =>
    `key-${filePath}-${StartTime}-${duration}`;

const router = Router();

router.use(BlockedJWTMiddleware);
// router.use(passport.authenticate("access-token", { session: false }));
router.use(accessTokenValidationMiddleware);

const parser: BodyParserMiddleware = new ExamParser();

var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

const face_auth_serverBaseUrl = `${process.env.ML_SO_IO_SERVER_BASE_D}:${process.env.ML_SO_IO_SERVER_PORT}`;
const fo_serverBaseUrl = `${process.env.ML_forbidden_objectURL}`; //fo:forbidden object
const gesture_serverBaseUrl = `${process.env.ML_gestureURL}`; //gesture:gesture}
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
            const fileInfo: ExamFileInfo = {
                examId: req.body.examId,
                chunkIndex: parseInt(req.body.chunckIndex),
                lastChunk: req.body.lastChunk == "true",
                chunk: req.file.buffer,
                chunkStartTime: parseInt(req.body.chunkStartTime),
                chunkEndTime: parseInt(req.body.chunkEndTime),
            };

            const examLogic: ExamsLogic = new ExamsLogicImpl();

            // save received chunk
            const filePath = await examLogic.saveRecording(
                fileInfo.chunk as Buffer,
                fileInfo.examId,
                req.body.userId,
                fileInfo.chunkIndex
            );

            if (fileInfo.lastChunk) {
                console.debug("has last chuck?", fileInfo.lastChunk);
                const studentLogic: StudentLogic = new StudentLogicImpl();
                await studentLogic.registerExamPath(
                    req.body["userId"],
                    req.body["examId"],
                    filePath
                );
                examLogic.postExamProcessing(
                    req.body["examId"],
                    req.body["userId"]
                );
            }

            // get playable buffer of received chunk
            const duration = fileInfo.chunkEndTime - fileInfo.chunkStartTime;
            const portion_args: [string, number, number] = [
                filePath,
                fileInfo.chunkStartTime,
                duration,
            ];
            const clipped_path = await get_video_portion(...portion_args);

            // save the path in cache
            // witch will delete it after certain time
            videoCache.set(cacheKey(...portion_args), clipped_path);

            // send to face_auth ML server

            const embedding: Embedding = await new StudentLogicImpl().getEmbedding(
                req.body.userId
            );
            if (embedding?.vector) {
                sendExamFile(
                    req.body.userId,
                    face_auth_serverBaseUrl,
                    fileInfo,
                    clipped_path,
                    report_res_face_auth,
                    embedding
                );
            } else {
                console.error("no embedding for student");
            }

            // send to forbidden object ML
            sendExamFile(
                req.body.userId,
                fo_serverBaseUrl,
                fileInfo,
                clipped_path,
                report_res_forbidden_objects
            );


            // send to gesture recognition
            sendExamFile(
                req.body.userId,
                gesture_serverBaseUrl,
                fileInfo,
                clipped_path,
                report_not_live
            );
        });
    }
);

router.get("/report", async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: ReportLogic = new ReportLogicImpl();

        // sanity check
        if (!req.query.userId) throw new Error("request must contain userId");
        if (!req.query.examId) throw new Error("request must contain examId");

        const studentId = req.query.userId as string;
        const examId = req.query.examId as string;
        const report = await logic.getReport(studentId, examId);
        console.debug(`sending ${report.length} reports`);

        return report;
    });
});

type PartSpecType = {
    startingTime: number;
    duration: number;
    userId: string;
    examId: string;
};

// FIXME restrict access to [student with same id, professor of exam, admin]
router.get("/video", async (req, res) => {
    const partSpec: PartSpecType = {
        startingTime: parseInt(req.query.startingTime as string),
        duration: parseInt(req.query.duration as string),
        userId: req.query.userId as string,
        examId: req.query.examId as string,
    };
    console.debug(partSpec);
    const filePath = get_video_path(partSpec.userId, partSpec.examId);

    // check from cache
    let cliped_path: string;
    const portion_args: [string, number, number] = [
        filePath,
        partSpec.startingTime,
        partSpec.duration,
    ];
    let temp = videoCache.get(cacheKey(...portion_args));
    if (temp) {
        cliped_path = temp as string;
    } else {
        cliped_path = await get_video_portion(
            filePath,
            partSpec.startingTime,
            partSpec.duration
        );
        videoCache.set(cacheKey(...portion_args), cliped_path);
    }

    const stat = fs.statSync(cliped_path);
    const fileSize = stat.size;

    const range = req.headers.range;
    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = end - start + 1;
        const file = fs.createReadStream(filePath, { start, end });
        const head = {
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": chunksize,
            "Content-Type": "video/mp4",
        };
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            "Content-Length": fileSize,
            "Content-Type": "video/mp4",
        };
        res.writeHead(200, head);
        fs.createReadStream(filePath).pipe(res);
    }
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

router.post(
    "/questions/current",
    onlyStudents,
    getQuestionParser,
    async (req, res) => {
        simpleFinalMWDecorator(res, async () => {
            const nextQReq = req as QuestionRequest;

            const q_index = nextQReq.studentExam.currentQuestionIndex;

            // if first visit return first question
            if (q_index == -1) {
                return await new QuestionLogicImpl().getNextQuestion(
                    nextQReq?.studentExam
                );
            }

            // if last question return done
            if (q_index === nextQReq.exam.questions?.length - 1) {
                return "done";
            }

            // return current index
            return await new QuestionLogicImpl().getQuestionByIndex(
                nextQReq.exam.id,
                q_index
            );
        });
    }
);

router.post("/questions/next", onlyStudents, answerParser, async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const nextQReq = req as NextQuestionRequest;

        // save the answer data in the db
        await new QuestionLogicImpl().saveAnswer(nextQReq.answer);

        // if last request return done
        if (
            nextQReq.studentExam.currentQuestionIndex ===
            nextQReq.exam.questions?.length - 1
        ) {
            return "done";
        }

        // return next question
        return await new QuestionLogicImpl().getNextQuestion(
            nextQReq?.studentExam
        );
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
    // TODO prevent editing exam while students are taking it
    simpleFinalMWDecorator(
        res,
        async () => {
            const logic: ExamsLogic = new ExamsLogicImpl();
            const examReq = req as ExamRequest;
            const exam = await logic.createExam(examReq.exam);
            console.debug(`created exam ${exam.id}`);
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
