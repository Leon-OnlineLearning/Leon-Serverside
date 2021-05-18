import passport, { BlockedJWTMiddleware } from "@services/Auth";
import { Router } from "express";
import BodyParserMiddleware from "@services/Routes/BodyParserMiddleware/BodyParserMiddleware";
import {
    CourseParser,
    CourseRequest,
} from "../BodyParserMiddleware/CourseParser";
import CoursesLogic from "@controller/BusinessLogic/Course/courses-logic";
import CourseLogicImpl from "@controller/BusinessLogic/Course/courses-logic-impl";
import { onlyAdmins, onlyProfessors } from "../User/AuthorizationMiddleware";
import simpleFinalMWDecorator from "@services/utils/RequestDecorator";
import { accessTokenValidationMiddleware } from "@services/Auth";

const router = Router();

router.use(BlockedJWTMiddleware);
// router.use(passport.authenticate("access-token", { session: false }));
router.use(accessTokenValidationMiddleware);

const parser: BodyParserMiddleware = new CourseParser();

router.get("/:courseId", async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: CoursesLogic = new CourseLogicImpl();
        const course = await logic.getCoursesById(req.params.courseId);
        return course;
    });
});

router.post("/", parser.completeParser, async (req, res) => {
    simpleFinalMWDecorator(
        res,
        async () => {
            const logic: CoursesLogic = new CourseLogicImpl();
            const courseReq = req as CourseRequest;
            const course = await logic.createCourse(courseReq.course);
            return course;
        },
        201
    );
});

router.put("/:courseId", parser.completeParser, async (req, res) => {
    simpleFinalMWDecorator(
        res,
        async () => {
            const logic: CoursesLogic = new CourseLogicImpl();
            const courseReq = req as CourseRequest;
            const course = await logic.updateCourse(
                req.params.courseId,
                courseReq.course
            );
            return course;
        },
        201
    );
});

router.patch("/:courseId", parser.partialParser, async (req, res) => {
    simpleFinalMWDecorator(
        res,
        async () => {
            const logic: CoursesLogic = new CourseLogicImpl();
            const courseReq = req as CourseRequest;
            const course = await logic.updateCourse(
                req.params.courseId,
                courseReq.course
            );
            return course;
        },
        201
    );
});

router.delete("/:courseId", async (req, res) => {
    simpleFinalMWDecorator(
        res,
        async () => {
            const logic: CoursesLogic = new CourseLogicImpl();
            await logic.deleteCourseById(req.params.courseId);
        },
        204
    );
});

router.get("/:courseId/stats", onlyProfessors, async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: CoursesLogic = new CourseLogicImpl();
        const stats = await logic.getLecturesStatistics(req.params.courseId);
        return stats;
    });
});

router.post("/:courseId/lectures", onlyProfessors, async (req, res) => {
    simpleFinalMWDecorator(
        res,
        async () => {
            const logic: CoursesLogic = new CourseLogicImpl();
            await logic.addLectureToCourse(
                req.params.courseId,
                req.body.lectureId
            );
        },
        200
    );
});

router.get("/:courseId/lectures", async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: CoursesLogic = new CourseLogicImpl();
        return await logic.getLecturesForCourse(req.params.courseId);
    });
});

router.post("/:courseId/exams", onlyProfessors, async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: CoursesLogic = new CourseLogicImpl();
        console.log("cid, eid", req.params.courseId, req.body.examId);

        await logic.addExamToCourse(req.params.courseId, req.body.examId);
    });
});

router.get("/:courseId/exams", async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: CoursesLogic = new CourseLogicImpl();
        return await logic.getAllExamsByCourse(req.params.courseId);
    });
});

router.get("/", async (_, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: CoursesLogic = new CourseLogicImpl();
        return await logic.getAllCourses();
    });
});

export default router;
