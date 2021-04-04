import passport, { BlockedJWTMiddleware } from "@services/Auth"
import { Router } from "express"
import BodyParserMiddleware from "@services/Routes/BodyParserMiddleware/BodyParserMiddleware"
import LectureParser, { LectureRequest } from "@services/Routes/BodyParserMiddleware/LectureParser"
import LecturesLogic from "@controller/BusinessLogic/Event/Lecture/lectures-logic"
import LecturesLogicImpl from "@controller/BusinessLogic/Event/Lecture/lectures-logic-impl"
import { onlyProfessors } from "@services/Routes/User/AuthorizationMiddleware"
import simpleFinalMWDecorator from "@services/utils/RequestDecorator"

const router = Router()

router.use(BlockedJWTMiddleware)
router.use(passport.authenticate('access-token', { session: false }))

const parser: BodyParserMiddleware = new LectureParser()

router.get('/:lectureId', async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: LecturesLogic = new LecturesLogicImpl()
        const exam = await logic.getLectureById(req.params.lectureId);
        return exam
    })
})

router.post('/', onlyProfessors, parser.completeParser, async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: LecturesLogic = new LecturesLogicImpl()
        const lectReq = req as LectureRequest
        const lecture = await logic.createLecture(lectReq.lecture)
        return lecture
    }, 201)
})

router.put('/:lectureId', parser.completeParser, async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: LecturesLogic = new LecturesLogicImpl()
        const lectReq = req as LectureRequest
        const lecture = await logic.updateLecture(req.params.lectureId, lectReq.lecture)
        return lecture;
    })
})


router.patch('/:lectureId', parser.partialParser, async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: LecturesLogic = new LecturesLogicImpl()
        const lecReq = req as LectureRequest
        const exam = await logic.updateLecture(req.params.lectureId, lecReq.lecture)
        return exam;
    })
})

router.delete('/:lectureId', async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: LecturesLogic = new LecturesLogicImpl()
        await logic.deleteLectureById(req.params.lectureId)
    }, 204)
})

export default router;