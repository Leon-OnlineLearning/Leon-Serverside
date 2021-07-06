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
    report_res,
} from "./recording_utils";

import fs from "fs";
import NodeCache from "node-cache";

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
            const fileInfo: ExamFileInfo = {
                examId: req.body.examId,
                chunkIndex: parseInt(req.body.chunckIndex),
                lastChunk: req.body.lastChunk,
                chunk: req.file.buffer,
                chunkStartTime: parseInt(req.body.chunkStartTime),
                chunkEndTime: parseInt(req.body.chunkEndTime),
            };

            // save recived chunk
            const filePath = await new ExamsLogicImpl().saveRecording(
                fileInfo.chunk as Buffer,
                fileInfo.examId,
                req.body.userId,
                fileInfo.chunkIndex
            );

			const studentLogic: StudentLogic = new StudentLogicImpl()
			await studentLogic.registerLecturePath(
				req.body["userId"],
				req.body["examId"],
				filePath
			);

            const embedding: Embedding = await new StudentLogicImpl().getEmbedding(
                req.body.userId
            );
            if (!embedding?.vector) {
                throw new Error("no embedding for student");
            }

            // get playaple buffer of recieved chunk
            const duration = fileInfo.chunkEndTime - fileInfo.chunkStartTime;
            const portion_args: [string, number, number] = [
                filePath,
                fileInfo.chunkStartTime,
                duration,
            ];
            const cliped_path = await get_video_portion(...portion_args);

            // save the path in cache
            // witch will delete it after certain time
            videoCache.set(cacheKey(...portion_args), cliped_path);

            // send to face_auth ML server
            await sendExamFile(
                req.body.userId,
                serverBaseUrl,
                fileInfo,
                cliped_path,
                embedding,
                report_res
            );
            // FIXME delete the file
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

// FIXME resrtict access to [student with same ip, professor of exam, admin]
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
