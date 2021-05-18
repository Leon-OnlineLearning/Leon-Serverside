import { Router } from "express";
import passport, {
    accessTokenValidationMiddleware,
    BlockedJWTMiddleware,
} from "@services/Auth";
import { onlyAdmins, onlyProfessors } from "../AuthorizationMiddleware";
import ProfessorLogic from "@controller/BusinessLogic/User/Professor/professors-logic";
import ProfessorLogicImpl from "@controller/BusinessLogic/User/Professor/professors-logic-impl";
import ProfessorParser, {
    ProfessorRequest,
} from "../../BodyParserMiddleware/ProfessorParser";
import Professor from "@models/Users/Professor";
import BodyParserMiddleware from "../../BodyParserMiddleware/BodyParserMiddleware";
import paginationParameters from "@services/Routes/utils/pagination";
import simpleFinalMWDecorator from "@services/utils/RequestDecorator";

const router = Router();
router.use(BlockedJWTMiddleware);
// router.use(passport.authenticate("access-token", { session: false }));
router.use(accessTokenValidationMiddleware);

const parser: BodyParserMiddleware = new ProfessorParser();

router.get("/", onlyAdmins, async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: ProfessorLogic = new ProfessorLogicImpl();
        const [skip, take] = paginationParameters(req);
        const professors = await logic.getAllProfessors(skip, take);
        return professors.map((prof) => prof.summary());
    });
});

router.post("/:professorId/lectures", onlyProfessors, async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: ProfessorLogic = new ProfessorLogicImpl();
        await logic.assignLectureToProfessor(
            req.params.professorId,
            req.body.lectureId
        );
    });
});

router.get("/:professorId/lectures", async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: ProfessorLogic = new ProfessorLogicImpl();
        const lectures = await logic.getLectures(req.params.professorId);
        return lectures;
    });
});

router.post("/", onlyAdmins, parser.completeParser, async (req, res) => {
    simpleFinalMWDecorator(
        res,
        async () => {
            const request = req as ProfessorRequest;
            const logic: ProfessorLogic = new ProfessorLogicImpl();
            const _professor = await logic.createProfessor(request.account);
            const professor = new Professor();
            professor.setValuesFromJSON(_professor);
            return professor.summary();
        },
        201
    );
});

router.put(
    "/:professorId",
    onlyProfessors,
    parser.completeParser,
    async (req, res) => {
        simpleFinalMWDecorator(res, async () => {
            const request = req as ProfessorRequest;
            const logic: ProfessorLogic = new ProfessorLogicImpl();
            const professor = await logic.updateProfessor(
                req.params.professorId,
                request.account as Professor
            );
            return professor.summary();
        });
    }
);

router.patch(
    "/:professorId",
    onlyProfessors,
    parser.partialParser,
    async (req, res) => {
        simpleFinalMWDecorator(res, async () => {
            const request = req as ProfessorRequest;
            const logic: ProfessorLogic = new ProfessorLogicImpl();
            const professor = await logic.updateProfessor(
                req.params.professorId,
                request.account as Professor
            );
            return professor.summary();
        });
    }
);

router.delete("/:professorId", onlyAdmins, async (req, res) => {
    simpleFinalMWDecorator(
        res,
        async () => {
            const logic: ProfessorLogic = new ProfessorLogicImpl();
            await logic.deleteProfessorById(req.params.professorId);
        },
        204
    );
});

router.get("/:professorId/exams", async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: ProfessorLogic = new ProfessorLogicImpl();
        const exams = await logic.getAllExams(req.params.professorId);
        return exams;
    });
});

router.post("/:professorId/courses", async (req, res) => {
    if (!req.body.courseId)
        res.status(400).send({
            success: false,
            message: "course id is not found in body",
        });
    simpleFinalMWDecorator(res, async () => {
        const logic: ProfessorLogic = new ProfessorLogicImpl();
        await logic.assignCourseToProfessor(
            req.params.professorId,
            req.body.courseId
        );
    });
});

router.get("/:professorId/courses", async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: ProfessorLogic = new ProfessorLogicImpl();
        const courses = await logic.getAllCourses(req.params.professorId);
        return courses;
    });
});

export default router;
