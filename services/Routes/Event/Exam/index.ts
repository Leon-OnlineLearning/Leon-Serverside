import passport, { BlockedJWTMiddleware } from "@services/Auth"
import { Router } from "express"
import BodyParserMiddleware from "@services/Routes/BodyParserMiddleware/BodyParserMiddleware"
import ExamParser, { ExamRequest } from "@services/Routes/BodyParserMiddleware/ExamParser"
import ExamsLogic from "@controller/BusinessLogic/Event/Exam/exam-logic"
import ExamsLogicImpl from "@controller/BusinessLogic/Event/Exam/exam-logic-impl"
import simpleFinalMWDecorator from "@services/utils/RequestDecorator"
import multer from "multer"
import { onlyStudents } from "@services/Routes/User/AuthorizationMiddleware"

const router = Router()

router.use(BlockedJWTMiddleware)
router.use(passport.authenticate('access-token', { session: false }))

const parser: BodyParserMiddleware = new ExamParser()

var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

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
router.put('/record',onlyStudents, upload.single('chuck'), async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: ExamsLogic = new ExamsLogicImpl()
        await logic.saveRecording(req.file.buffer, req.body.examId, req.body.userId);
    })
})

router.get('/:examId', async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: ExamsLogic = new ExamsLogicImpl()
        const exam = await logic.getExamById(req.params.examId);
        return exam
    })
})

router.get('/', async (req, res) => {
    const year = req.body.year
    if (!year || !parseInt(year))
        res.status(400).send({ success: false, message: "Invalid year" })
    simpleFinalMWDecorator(res, async () => {
        const logic: ExamsLogic = new ExamsLogicImpl()
        const exams = await logic.getExamsByYear(year)
        return exams
    })
})

router.post('/', parser.completeParser, async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: ExamsLogic = new ExamsLogicImpl()
        const examReq = req as ExamRequest
        const exam = await logic.createExam(examReq.exam)
        return exam
    }, 201)
})

router.put('/:examId', parser.completeParser, async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: ExamsLogic = new ExamsLogicImpl()
        const examReq = req as ExamRequest
        const exam = await logic.updateExam(req.params.examId, examReq.exam)
        return exam
    })
})


router.patch('/:examId', parser.partialParser, async (req, res) => {
    simpleFinalMWDecorator(res, async ()=>{
        const logic: ExamsLogic = new ExamsLogicImpl()
        const examReq = req as ExamRequest
        const exam = await logic.updateExam(req.params.examId, examReq.exam)
        return exam
    })
})

router.delete('/:examId', async (req, res) => {
    simpleFinalMWDecorator(res, async()=>{
        const logic: ExamsLogic = new ExamsLogicImpl()
        await logic.deleteExamById(req.params.examId)
    })
})

export default router;