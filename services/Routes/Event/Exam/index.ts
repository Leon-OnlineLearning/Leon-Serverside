import passport, { BlockedJWTMiddleware } from "@services/Auth"
import { Router } from "express"
import BodyParserMiddleware from "@services/Routes/BodyParserMiddleware/BodyParserMiddleware"
import ExamParser, { ExamRequest } from "@services/Routes/BodyParserMiddleware/ExamParser"
import ExamsLogic from "@controller/BusinessLogic/Event/Exam/exam-logic"
import ExamsLogicImpl from "@controller/BusinessLogic/Event/Exam/exam-logic-impl"

const router = Router()

router.use(BlockedJWTMiddleware)
router.use(passport.authenticate('access-token', { session: false }))

const parser: BodyParserMiddleware = new ExamParser()

router.get('/:examId', async (req, res) => {
    const logic: ExamsLogic = new ExamsLogicImpl()
    try {
        const exam = await logic.getExamById(req.params.examId);
        res.send(exam)
    } catch (e) {
        res.status(400).send({ success: false, message: e.message })
    }
})

router.get('/', async (req, res) => {
    const year = req.body.year
    if (!year || !parseInt(year))
        res.status(400).send({ success: false, message: "Invalid year" })
    const logic: ExamsLogic = new ExamsLogicImpl()
    try {
        const exams = await logic.getExamsByYear(year)
        res.send(exams)
    } catch (e) {
        res.status(400).send({ success: false, message: e.message })
    }
})

router.post('/', parser.completeParser, async (req, res) => {
    const logic: ExamsLogic = new ExamsLogicImpl()
    const examReq = req as ExamRequest
    try {
        const exam = await logic.createExam(examReq.exam)
        res.status(201).send(exam)
    } catch (e) {
        res.status(400).send({ success: false, message: e.message })
    }
})

router.put('/:examId', parser.completeParser, async (req, res) => {
    const logic: ExamsLogic = new ExamsLogicImpl()
    const examReq = req as ExamRequest
    try {
        const exam = await logic.updateExam(req.params.examId, examReq.exam)
        res.send(exam)
    } catch (e) {
        res.status(400).send({ success: false, message: e.message })
    }
})


router.patch('/:examId', parser.partialParser, async (req, res) => {
    const logic: ExamsLogic = new ExamsLogicImpl()
    const examReq = req as ExamRequest
    try {
        const exam = await logic.updateExam(req.params.examId, examReq.exam)
        res.send(exam)
    } catch (e) {
        res.status(400).send({ success: false, message: e.message })
    }
})

router.delete('/:examId', async (req, res) => {
    const logic: ExamsLogic = new ExamsLogicImpl()
    const examReq = req as ExamRequest
    try {
        await logic.deleteExamById(req.params.examId)
        res.send({ success: true })
    } catch (e) {
        res.status(400).send({ success: false, message: e.message })
    }
})

export default router;