import { Request, Router } from "express"
import passport, { BlockedJWTMiddleware } from "@services/Auth"
import { onlyAdmins } from "../AuthorizationMiddleware"
import StudentLogic from "@controller/BusinessLogic/User/Student/students-logic"
import StudentLogicImpl from "@controller/BusinessLogic/User/Student/students-logic-impl"
import StudentParser from "../BodyParserMiddleware/StudentParser"
import Student from "@models/Users/Student"
import { UserRequest } from "../BodyParserMiddleware/UserParser"

const router = Router()

router.use(BlockedJWTMiddleware)
router.use(passport.authenticate('access-token', { session: false }))

router.get('/', onlyAdmins, async (req, res) => {
    const logic: StudentLogic = new StudentLogicImpl()
    const students = await logic.getAllStudents()
    res.send(students)
})

router.post('/', onlyAdmins, StudentParser, async (req, res) => {
    const request = req as UserRequest
    const logic: StudentLogic = new StudentLogicImpl()
    try {
        const student = await logic.createStudent(request.account as Student)
        res.send(student)
    } catch (e) {
        res.status(400).send({ success: false, message: e.message })
    }
})

export default router;
