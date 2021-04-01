import { Router } from "express"
import passport, { BlockedJWTMiddleware } from "@services/Auth"
import { onlyAdmins, onlyProfessors } from "../AuthorizationMiddleware"
import ProfessorLogic from "@controller/BusinessLogic/User/Professor/professors-logic"
import ProfessorLogicImpl from "@controller/BusinessLogic/User/Professor/professors-logic-impl"
import ProfessorParser, { ProfessorRequest } from "../../BodyParserMiddleware/ProfessorParser"
import Professor from "@models/Users/Professor"
import BodyParserMiddleware from "../../BodyParserMiddleware/BodyParserMiddleware"
import { TableForeignKey } from "typeorm"
import paginationParameters from "@services/Routes/utils/pagination"
import simpleFinalMWDecorator from "@services/utils/RequestDecorator"

const router = Router()
router.use(BlockedJWTMiddleware)
router.use(passport.authenticate('access-token', { session: false }))

const parser: BodyParserMiddleware = new ProfessorParser()

router.get('/', onlyAdmins, async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: ProfessorLogic = new ProfessorLogicImpl()
        const [skip, take] = paginationParameters(req)
        const professors = await logic.getAllProfessors(skip, take)
        return professors.map(prof => prof.summary())
    })
})

router.post('/', onlyAdmins, parser.completeParser, async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const request = req as ProfessorRequest
        const logic: ProfessorLogic = new ProfessorLogicImpl()
        const professor = await logic.createProfessor(request.account)
        res.status(201).send(await professor.summary())
    }, 201)
})

router.put('/:professorId', onlyProfessors, parser.completeParser, async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const request = req as ProfessorRequest
        const logic: ProfessorLogic = new ProfessorLogicImpl()
        const professor = await logic.updateProfessor(req.params.professorId, request.account as Professor)
        return professor.summary()
    })
})

router.patch("/:professorId", onlyProfessors, parser.partialParser, async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const request = req as ProfessorRequest
        const logic: ProfessorLogic = new ProfessorLogicImpl()
        const professor = await logic.updateProfessor(req.params.professorId, request.account as Professor)
        return professor.summary()
    })
})

router.delete("/:professorId", onlyAdmins, async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: ProfessorLogic = new ProfessorLogicImpl()
        await logic.deleteProfessorById(req.params.professorId)
    }, 204)
})

router.get("/:professorId/exams", async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: ProfessorLogic = new ProfessorLogicImpl()
        const exams = await logic.getAllExams(req.params.professorId)
        res.send(exams)
    })
})

router.post('/:professorId/courses', async (req, res) => {
    if (!req.body.courseId) res.status(400).send({ success: false, message: 'course id is not found in body' })
    simpleFinalMWDecorator(res, async () => {
        const logic: ProfessorLogic = new ProfessorLogicImpl()
        await logic.assignCourseToProfessor(req.params.professorId, req.body.courseId);
        res.send({ success: true })
    })
})

router.get('/:professorId/courses', async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: ProfessorLogic = new ProfessorLogicImpl()
        const courses = await logic.getAllCourses(req.params.professorId)
        return courses
    })
})

export default router;
