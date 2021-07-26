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
    get_primary_video_path,
    get_video_portion,
    isRecordLive,
    report_not_live,
    report_res_face_auth,
    report_res_forbidden_objects,
} from "./recording_utils";

import fs from "fs";
import NodeCache from "node-cache";
import QuestionLogicImpl from "@controller/BusinessLogic/Event/Exam/question-logic-impl";
import UserInputError from "@services/utils/UserInputError";
import StudentsExamData from "@models/JoinTables/StudentExam";
import { userTockenData } from "../event.routes";
import UserTypes from "@models/Users/UserTypes";

const videoCache = new NodeCache({ stdTTL: 60 * 60 });
videoCache.on("del", (key, val) => {
    console.debug(`deleting cached file ${val}`);
    fs.unlink(val, console.error);
    // TODO test if this work
});
const cacheKey = (filePath: string, StartTime: number, duration: number) =>
    `key-${filePath}-${StartTime}-${duration}`;

const router = Router();
const open_router_secondary = Router();

router.use(BlockedJWTMiddleware);
// router.use(passport.authenticate("access-token", { session: false }));
router.use(accessTokenValidationMiddleware);

const parser: BodyParserMiddleware = new ExamParser();

var storage = multer.memoryStorage();
var upload = multer({ storage: storage });
var upload2 = multer({ storage: storage });

const face_auth_serverBaseUrl = `${process.env.ML_SO_IO_SERVER_BASE_D}:${process.env.ML_SO_IO_SERVER_PORT}`;
const fo_serverBaseUrl = `${process.env.ML_forbidden_objectURL}`; //fo:forbidden object
const gesture_serverBaseUrl = `${process.env.ML_gestureURL}`; //gesture:gesture}

/**
 * save exam recording secondary camera
 *
 *
 */
open_router_secondary.put(
    "/record/secondary",
    upload2.single("chuck"),
    async (req, res) => {
        console.log(req.file);
        console.log(req.body);
        const userId = req.body.userId;
        let studentExam: StudentsExamData;
        try {
            studentExam = await new ExamsLogicImpl().getStudentExam(
                userId,
                req.body.examId
            );
            // check the secret
            if (req.body.secret !== studentExam.secondary_secret) {
                throw new Error("wrong secret");
            }
        } catch (error: any) {
            if (error.message === "wrong secret") {
                res.status(400).send({
                    success: false,
                    message: "invalid secret",
                });
            } else {
                res.status(400).send({
                    success: false,
                    message: error.message,
                });
            }
            return;
        }
        simpleFinalMWDecorator(res, async () => {
            const fileInfo: ExamFileInfo = {
                examId: req.body.examId,
                chunkIndex: parseInt(req.body.chunckIndex),
                lastChunk: req.body.lastChunk == "true",
                chunk: req.file.buffer,
                chunkStartTime: parseInt(req.body.chunkStartTime),
                chunkEndTime: parseInt(req.body.chunkEndTime),
            };

            console.debug(`uploading from secondary ${fileInfo.chunkIndex}`);

            const source_number = 2;

            // save to 2nd recording
            const examLogic: ExamsLogic = new ExamsLogicImpl();

            const filePath = await examLogic.saveRecording(
                fileInfo.chunk as Buffer,
                fileInfo.examId,
                req.body.userId,
                fileInfo.chunkIndex as number,
                source_number
            );

            // update time in student exam
            studentExam.last_record_secondary = new Date();
            examLogic.saveStudentExam(studentExam);

            // send to ML forbidden object
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

            // send to forbidden object ML
            sendExamFile(
                req.body.userId,
                fo_serverBaseUrl,
                fileInfo,
                clipped_path,
                report_res_forbidden_objects
            );
        });
    }
);

/**
 * save exam recording
 * 
 * req body must contain
 * - usedId 
 * - examId
 * - chunkIndex : number of current chunk
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

            const source_number = 1;
            // save received chunk
            const filePath = await examLogic.saveRecording(
                fileInfo.chunk as Buffer,
                fileInfo.examId,
                req.body.userId,
                fileInfo.chunkIndex as number,
                source_number
            );

            // update time in student exam
            const studentExam = await examLogic.getStudentExam(
                req.body.userId,
                fileInfo.examId
            );
            studentExam.last_record_primary = new Date();
            examLogic.saveStudentExam(studentExam);

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
            // TODO don't send if exam didn't started yet
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
        });
    }
);

router.get("/report", async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        // sanity check
        if (!req.query.userId)
            throw new UserInputError("request must contain userId");
        if (!req.query.examId)
            throw new UserInputError("request must contain examId");

        const logic: ReportLogic = new ReportLogicImpl();

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

/**
 * mark portion of the video as life check and report it to ML service
 */
router.put("/liveness", async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        // sanity check
        if (!req.body.userId)
            throw new UserInputError("request must contain userId");
        if (!req.body.examId)
            throw new UserInputError("request must contain examId");

        const studentId = req.body.userId as string;
        const examId = req.body.examId as string;
        const fileInfo: ExamFileInfo = {
            chunkStartTime: parseInt(req.body.startingTime),
            chunkEndTime: parseInt(req.body.endingTime),
            examId,
        };

        const filePath = get_primary_video_path(studentId, examId);

        const duration = fileInfo.chunkEndTime - fileInfo.chunkStartTime;
        const portion_args: [string, number, number] = [
            filePath,
            fileInfo.chunkStartTime,
            duration,
        ];
        setTimeout(async () => {
            const clipped_path = await get_video_portion(...portion_args);

            // save the path in cache
            // witch will delete it after certain time
            videoCache.set(cacheKey(...portion_args), clipped_path);

            // send to gesture recognition
            sendExamFile(
                studentId,
                gesture_serverBaseUrl,
                fileInfo,
                clipped_path,
                report_not_live
            );
        }, duration * 1000);

        // const report = await logic.reportLifeCheck(partSpec);
        // console.debug(`sending ${report.length} reports`);
    });
});

// FIXME restrict access to [student with same id]
router.get("/video", onlyStudents, async (req, res) => {
    const partSpec: PartSpecType = {
        startingTime: parseInt(req.query.startingTime as string),
        duration: parseInt(req.query.duration as string),
        userId: req.query.userId as string,
        examId: req.query.examId as string,
    };
    console.debug(partSpec);
    const filePath = get_primary_video_path(partSpec.userId, partSpec.examId);

    // TODO get report of secondary camera
    // check from cache
    let clipped_path: string;
    const portion_args: [string, number, number] = [
        filePath,
        partSpec.startingTime,
        partSpec.duration,
    ];
    let temp = videoCache.get(cacheKey(...portion_args));
    if (temp) {
        clipped_path = temp as string;
    } else {
        clipped_path = await get_video_portion(
            filePath,
            partSpec.startingTime,
            partSpec.duration
        );
        videoCache.set(cacheKey(...portion_args), clipped_path);
    }

    const stat = fs.statSync(clipped_path);
    const fileSize = stat.size;

    const range = req.headers.range;
    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunk_size = end - start + 1;
        const file = fs.createReadStream(filePath, { start, end });
        const head = {
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": chunk_size,
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
        console.debug(`available exams ${exams.length}`);
        return exams;
    });
});

router.get(
    "/secondarySecret/:examId/:studentId",
    onlyStudents,
    async (req, res) => {
        simpleFinalMWDecorator(res, async () => {
            // TODO check timing
            const examLogic: ExamsLogic = new ExamsLogicImpl();
            const studentExam = await examLogic.getStudentExam(
                req.params.studentId,
                req.params.examId
            );

            // generate random string as secret
            return studentExam.secondary_secret;
        });
    }
);

router.get("/:examId", async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: ExamsLogic = new ExamsLogicImpl();
        const exam = await logic.getExamById(req.params.examId);

        const user = req.user as userTockenData;
        if (user.role === UserTypes.STUDENT) {
            const studentId = user.id;
            try {
                await logic.getStudentExam(studentId, exam.id);
            } catch (error) {
                await new QuestionLogicImpl().initiateExam(
                    req.params.examId,
                    studentId
                );
            }
        }
        return exam;
    });
});

router.get("/:examId/:userId/isLive", async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const examLogic: ExamsLogic = new ExamsLogicImpl();
        const studentExam = await examLogic.getStudentExam(
            req.params.userId,
            req.params.examId
        );
        if (!studentExam) throw new UserInputError("exam wasn't initialized");

        return examLogic.isRecordLive(studentExam);
    });
});

// TODO check recording is live
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
            // TODO attach to professor and course
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

export { router as default, open_router_secondary };
