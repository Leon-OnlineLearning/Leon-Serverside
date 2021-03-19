import { Request, Router } from "express"
import passport, { BlockedJWTMiddleware } from "@services/Auth"
import { onlyAdmins } from "../AuthorizationMiddleware"
import StudentLogic from "@controller/BusinessLogic/User/Student/students-logic"
import StudentLogicImpl from "@controller/BusinessLogic/User/Student/students-logic-impl"
import { StudentParser, StudentPartialParser, StudentRequest } from "../BodyParserMiddleware/StudentParser"
import Student from "@models/Users/Student"

const router = Router()

router.use(BlockedJWTMiddleware)
router.use(passport.authenticate('access-token', { session: false }))

router.get('/', onlyAdmins, async (req, res) => {
    const logic: StudentLogic = new StudentLogicImpl()
    const students = await logic.getAllStudents()
    res.send(students)
})

router.post('/', onlyAdmins, StudentParser, async (req, res) => {
    const request = req as StudentRequest
    const logic: StudentLogic = new StudentLogicImpl()
    try {
        const student = await logic.createStudent(request.account as Student)
        res.send(student.summary())
    } catch (e) {
        res.status(400).send({ success: false, message: e.message })
    }
})

router.put('/:studentId', StudentPartialParser, async (req, res) => {
    const request = req as StudentRequest
    const logic: StudentLogic = new StudentLogicImpl()
    try {
        const student = await logic.updateStudent(req.params.studentId, request.account as Student)
        res.send(student.summary())
    } catch (e) {
        res.status(400).send({ message: e.message, success: false })
    }
})

export default router;
