import { Request, Router } from "express"
import passport, { BlockedJWTMiddleware } from "@services/Auth"
import { onlyAdmins, onlyStudents } from "../AuthorizationMiddleware"
import StudentLogic from "@controller/BusinessLogic/User/Student/students-logic"
import StudentLogicImpl from "@controller/BusinessLogic/User/Student/students-logic-impl"
import { StudentParser, StudentRequest } from "../../BodyParserMiddleware/StudentParser"
import Student from "@models/Users/Student"
import BodyParserMiddleware from "../../BodyParserMiddleware/BodyParserMiddleware"
import paginationParameters from "@services/Routes/utils/pagination"

const router = Router()
router.use(BlockedJWTMiddleware)
router.use(passport.authenticate('access-token', { session: false }))

const parser: BodyParserMiddleware = new StudentParser()

/**
 * expected: naive pagination
 * /students?page=2&size=10
 */
router.get('/', onlyAdmins, async (req, res) => {
    const logic: StudentLogic = new StudentLogicImpl()
    const [skip, take] = paginationParameters(req)
    const students = await logic.getAllStudents(skip, take)
    res.send(students)
})

router.post('/', onlyAdmins, parser.completeParser, async (req, res) => {
    const request = req as StudentRequest
    const logic: StudentLogic = new StudentLogicImpl()
    try {
        const student = await logic.createStudent(request.account as Student)
        res.status(201).send(student.summary())
    } catch (e) {
        res.status(400).send({ success: false, message: e.message })
    }
})

router.put('/:studentId', parser.completeParser, async (req, res) => {
    const request = req as StudentRequest
    const logic: StudentLogic = new StudentLogicImpl()
    try {
        const student = await logic.updateStudent(req.params.studentId, request.account as Student)
        res.send(student.summary())
    } catch (e) {
        res.status(400).send({ message: e.message, success: false })
    }
})

router.patch('/:studentId', onlyStudents ,parser.partialParser, async (req, res) => {
    const request = req as StudentRequest
    const logic: StudentLogic = new StudentLogicImpl()
    try {
        const student = await logic.updateStudent(req.params.studentId, request.account as Student)
        res.send(student.summary())
    } catch (e) {
        res.status(400).send({ message: e.message, success: false })
    }
})

router.post('/:studentId/lectures', async (req, res) => {
    const logic: StudentLogic = new StudentLogicImpl()
    try {
        await logic.attendLecture(req.params.studentId, req.body.lectureId)
        res.status(201).send({ success: true })
    } catch (e) {
        res.status(400).send({ message: e.message, success: false })
    }
})

router.get('/:studentId/lectures', async (req, res) => {
    const logic: StudentLogic = new StudentLogicImpl()
    try {
        const courses = await logic.getAllCourses(req.params.studentId)
        res.send(courses)
    } catch (e) {
        res.status(400).send({ message: e.message, success: false })
    }
})

router.post('/:studentId/exams', async (req, res) => {
    const logic: StudentLogic = new StudentLogicImpl()
    try {
        await logic.attendExam(req.params.studentId, req.body.examId)
        res.status(201).send({ success: true })
    } catch (e) {
        res.status(400).send({ message: e.message, success: false })
    }
})

router.get('/:studentId/courses', async (req, res) => {
    const logic: StudentLogic = new StudentLogicImpl()
    try {
        await logic.getAllCourses(req.params.studentId)
        res.send({ success: true })
    } catch (e) {
        res.status(400).send({ message: e.message, success: false })
    }
})

router.post('/:studentId/courses', async (req, res) => {
    if (req.body.course) {
        res.send(400).send({ success: false, message: "Request body doesn't include 'Course Id'" })
    }
    const logic: StudentLogic = new StudentLogicImpl()
    try {
        await logic.addCourse(req.params.studentId, req.body.course)
        res.status(201).send({ success: true })
    } catch (e) {
        res.status(400).send({ message: e.message, success: false })
    }
})

router.delete('/:studentId/courses', async (req, res) => {
    if (req.body.courseId)
        res.status(400).send({ success: false, message: "Request body doesn't include 'Course Id'" })
    const logic: StudentLogic = new StudentLogicImpl()
    try {
        await logic.cancelCourse(req.params.studentId, req.body.courseId)
        res.send({ success: true })
    } catch (e) {
        res.status(400).send({ message: e.message, success: false })
    }
})

export default router;
