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

const router = Router()
router.use(BlockedJWTMiddleware)
router.use(passport.authenticate('access-token', { session: false }))

const parser: BodyParserMiddleware = new ProfessorParser()

router.get('/', onlyAdmins, async (req, res) => {
    const logic: ProfessorLogic = new ProfessorLogicImpl()
    const [skip, take] = paginationParameters(req)
    const professors = await logic.getAllProfessors(skip, take)
    res.send(professors.map(prof => prof.summary()))
})

router.post('/', onlyAdmins, parser.completeParser, async (req, res) => {
    const request = req as ProfessorRequest
    const logic: ProfessorLogic = new ProfessorLogicImpl()
    try {
        const _professor = await logic.createProfessor(request.account)
        const professor = new Professor()
        professor.setValuesFromJSON(_professor)
        res.status(201).send(await professor.summary())
    } catch (e) {
        res.status(400).send({ success: false, message: e.message })
    }
})

router.put('/:professorId', onlyProfessors, parser.completeParser, async (req, res) => {
    const request = req as ProfessorRequest
    const logic: ProfessorLogic = new ProfessorLogicImpl()
    try {
        const professor = await logic.updateProfessor(req.params.professorId, request.account as Professor)
        res.send(professor.summary())
    } catch (e) {
        res.send(400).send({ success: false, message: e.message })
    }
})

router.patch("/:professorId", onlyProfessors, parser.partialParser, async (req, res) => {
    const request = req as ProfessorRequest
    const logic: ProfessorLogic = new ProfessorLogicImpl()
    try {
        const professor = await logic.updateProfessor(req.params.professorId, request.account as Professor)
        res.send(professor.summary())
    } catch (e) {
        res.send(400).send({ success: false, message: e.message })
    }
})

router.delete("/:professorId", onlyAdmins, async (req, res) => {
    const logic: ProfessorLogic = new ProfessorLogicImpl()
    try {
        await logic.deleteProfessorById(req.params.professorId)
        res.send({ success: true })
    } catch (e) {
        res.send(400).send({ success: false, message: e.message })
    }
})

router.get("/:professorId/exams", async (req, res) => {
    const logic: ProfessorLogic = new ProfessorLogicImpl()
    try {
        const exams = await logic.getAllExams(req.params.professorId)
        res.send(exams)
    } catch (e) {
        res.send(400).send({ success: false, message: e.message })
    }
})

router.post('/:professorId/courses', async (req, res) => {
    const logic: ProfessorLogic = new ProfessorLogicImpl()
    if (!req.body.courseId) res.status(400).send({ success: false, message: 'course id is not found in body' })
    try {
        await logic.assignCourseToProfessor(req.params.professorId, req.body.courseId);
        res.send({ success: true })
    }
    catch (e) {
        res.status(400).send({ success: false, message: e.message })
    }
})

router.get('/:professorId/courses', async (req, res) => {
    const logic: ProfessorLogic = new ProfessorLogicImpl()
    try {
        const courses = await logic.getAllCourses(req.params.professorId)
        res.json(courses)
    } catch (e) {
        res.status(400).send({ success: false, message: e.message })
    }
})

export default router;
