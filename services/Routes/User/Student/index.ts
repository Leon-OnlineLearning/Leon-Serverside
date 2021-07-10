import { Request, Router } from "express";
import passport, {
    accessTokenValidationMiddleware,
    BlockedJWTMiddleware,
} from "@services/Auth";
import { onlyAdmins, onlyStudents } from "../AuthorizationMiddleware";
import StudentLogic from "@controller/BusinessLogic/User/Student/students-logic";
import StudentLogicImpl from "@controller/BusinessLogic/User/Student/students-logic-impl";
import {
    StudentParser,
    StudentRequest,
} from "../../BodyParserMiddleware/StudentParser";
import Student from "@models/Users/Student";
import BodyParserMiddleware from "../../BodyParserMiddleware/BodyParserMiddleware";
import paginationParameters from "@services/Routes/utils/pagination";
import simpleFinalMWDecorator from "@services/utils/RequestDecorator";
import DepartmentsLogicImpl from "@controller/BusinessLogic/Department/departments-logic-impl";
import UserInputError from "@services/utils/UserInputError";
import multer from "multer";
import { sendInitialVideo } from "@controller/sending/sendFiles";
import studentWithNoEmbedding from "./StudentWithNoEmbedding";

const router = Router();
router.use(BlockedJWTMiddleware);
// router.use(passport.authenticate("access-token", { session: false }));
router.use(accessTokenValidationMiddleware);

const parser: BodyParserMiddleware = new StudentParser();

var storage = multer.memoryStorage();
var upload = multer({ storage: storage });
/**
 *
 * req body must contain
 * - usedId
 * - chuck : actual recorded chunk in webm format
 * TODO add only students
 */
router.put(
    "/refrance",
    onlyStudents,
    upload.single("chuck"),
    async (req, res) => {
        simpleFinalMWDecorator(res, async () => {
            const serverBaseUrl = `${process.env.ML_SO_IO_SERVER_BASE_D}:${process.env.ML_SO_IO_SERVER_PORT}`;
            sendInitialVideo(
                req.file.buffer,
                req.body.userId,
                serverBaseUrl,
                async (student_id: string, emmbedding: any) => {
                    const logic: StudentLogic = new StudentLogicImpl();
                    logic.setEmbedding(student_id, emmbedding);
                    console.debug(`emeding saved for user ${student_id}`);
                }
            );
            // NOTE don't think we need to save refrance
            // await logic.saveRecording(req.file.buffer, req.body.examId, req.body.userId);
        });
    }
);
/**
 * expected: naive pagination
 * /students?page=2&size=10
 */
router.get("/", onlyAdmins, async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: StudentLogic = new StudentLogicImpl();
        const [skip, take] = paginationParameters(req);
        const students = await logic.getAllStudents(skip, take);
        return students;
    });
});

router.get("/:studentId/embedding", onlyAdmins, async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: StudentLogic = new StudentLogicImpl();
        const embedding = await logic.getEmbedding(req.params.studentId);
        return { embedding: embedding.vector };
    });
});

router.post("/:studentId/embedding", onlyAdmins, async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        if (!req.body.embedding) {
            throw new UserInputError("Embedding wasn't provided");
        }
        const logic: StudentLogic = new StudentLogicImpl();
        return await logic.setEmbedding(
            req.params.studentId,
            req.body.embedding
        );
    });
});

router.put("/:studentId/embedding", onlyAdmins, async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        if (!req.body.embedding) {
            throw new UserInputError("Embedding wasn't provided");
        }
        const logic: StudentLogic = new StudentLogicImpl();
        return await logic.setEmbedding(
            req.params.studentId,
            req.body.embedding
        );
    });
});

router.post("/", onlyAdmins, parser.completeParser, async (req, res) => {
    simpleFinalMWDecorator(
        res,
        async () => {
            const request = req as StudentRequest;
            const logic: StudentLogic = new StudentLogicImpl();
            const studentData = request.account;
            const depLogic = new DepartmentsLogicImpl();
            const department = await depLogic.getDepartmentById(
                req.body.departmentId
            );
            studentData.department = department;
            const _student = await logic.createStudent(studentData);
            const student = new Student();
            student.setValuesFromJSON(_student);

            return student.summary();
        },
        201
    );
});

router.put("/:studentId", parser.completeParser, async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const request = req as StudentRequest;
        const logic: StudentLogic = new StudentLogicImpl();
        const student = await logic.updateStudent(
            req.params.studentId,
            request.account as Student
        );
        return student.summary();
    });
});

router.patch(
    "/:studentId",
    onlyStudents,
    parser.partialParser,
    async (req, res) => {
        simpleFinalMWDecorator(res, async () => {
            const request = req as StudentRequest;
            const logic: StudentLogic = new StudentLogicImpl();
            const student = await logic.updateStudent(
                req.params.studentId,
                request.account as Student
            );
            return student.summary();
        });
    }
);

router.post("/:studentId/lectures", async (req, res) => {
    simpleFinalMWDecorator(
        res,
        async () => {
            const logic: StudentLogic = new StudentLogicImpl();
            await logic.attendLecture(req.params.studentId, req.body.lectureId);
        },
        201
    );
});

router.get("/:studentId/lectures", async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: StudentLogic = new StudentLogicImpl();
        const lectures = await logic.getAllLectures(req.params.studentId);
        return lectures;
    });
});

router.post("/:studentId/exams", studentWithNoEmbedding, async (req, res) => {
    simpleFinalMWDecorator(
        res,
        async () => {
            const logic: StudentLogic = new StudentLogicImpl();
            const videoId = "get video id for student"; // TODO
            await logic.registerExamPath(
                req.params.studentId,
                req.body.examId,
                videoId
            );
        },
        201
    );
});

router.get("/:studentId/courses", async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: StudentLogic = new StudentLogicImpl();
        const courses = await logic.getAllCourses(req.params.studentId);
        return courses;
    });
});

router.get("/:studentId/events", async (req, res) => {
    let startingFrom: string;
    let endingAt: string;
    console.log("query parameters", req.query);
    if (
        typeof req.query.startingFrom === "string" &&
        typeof req.query.endingAt === "string"
    ) {
        startingFrom = req.query.startingFrom;
        endingAt = req.query.endingAt;
    } else {
        res.status(400).send({
            success: false,
            message: "You should provide the start time and ending time",
        });
        return;
    }
    simpleFinalMWDecorator(res, async () => {
        const logic: StudentLogic = new StudentLogicImpl();
        return logic.getAllEvents(req.params.studentId, startingFrom, endingAt);
    });
});

router.get("/:studentId/attendance", async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: StudentLogic = new StudentLogicImpl();
        return await logic.getStudentAttendance(req.params.studentId);
    });
});

export default router;
