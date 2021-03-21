import passport, { BlockedJWTMiddleware } from "@services/Auth"
import { Router } from "express"
import BodyParserMiddleware from "@services/Routes/BodyParserMiddleware/BodyParserMiddleware"
import LectureParser, { LectureRequest } from "@services/Routes/BodyParserMiddleware/LectureParser"
import LecturesLogic from "@controller/BusinessLogic/Event/Lecture/lectures-logic"
import LecturesLogicImpl from "@controller/BusinessLogic/Event/Lecture/lectures-logic-impl"

const router = Router()

router.use(BlockedJWTMiddleware)
router.use(passport.authenticate('access-token', { session: false }))

const parser: BodyParserMiddleware = new LectureParser()

router.get('/:examId', async (req, res) => {
    const logic: LecturesLogic = new LecturesLogicImpl()
    try {
        const exam = await logic.getLectureById(req.params.examId);
        res.send(exam)
    } catch (e) {
        res.status(400).send({ success: false, message: e.message })
    }
})

router.post('/', parser.completeParser, async (req, res) => {
    const logic: LecturesLogic = new LecturesLogicImpl()
    const lectReq = req as LectureRequest
    try {
        const exam = await logic.createLecture(lectReq.lecture)
        res.send(exam)
    } catch (e) {
        res.status(400).send({ success: false, message: e.message })
    }
})

router.put('/:lectureId', parser.completeParser, async (req, res) => {
    const logic: LecturesLogic = new LecturesLogicImpl()
    const lectReq = req as LectureRequest
    try {
        const lecture = await logic.updateLecture(req.params.lectureId, lectReq.lecture)
        res.send(lecture)
    } catch (e) {
        res.status(400).send({ success: false, message: e.message })
    }
})


router.patch('/:lectureId', parser.partialParser, async (req, res) => {
    const logic: LecturesLogic = new LecturesLogicImpl()
    const lecReq = req as LectureRequest
    try {
        const exam = await logic.updateLecture(req.params.lectureId, lecReq.lecture)
        res.send(exam)
    } catch (e) {
        res.status(400).send({ success: false, message: e.message })
    }
})

router.delete('/:lectureId', async (req, res) => {
    const logic: LecturesLogic = new LecturesLogicImpl()
    const examReq = req as LectureRequest
    try {
        await logic.deleteLectureById(req.params.lectureId)
        res.send({ success: true })
    } catch (e) {
        res.status(400).send({ success: false, message: e.message })
    }
})