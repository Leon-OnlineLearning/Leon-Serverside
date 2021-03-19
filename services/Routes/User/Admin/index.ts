import { Router } from "express"
import passport, { BlockedJWTMiddleware } from "@services/Auth"
import { onlyAdmins } from "../AuthorizationMiddleware"
import StudentLogic from "@controller/BusinessLogic/User/Student/students-logic"
import StudentLogicImpl from "@controller/BusinessLogic/User/Student/students-logic-impl"
import AdminParser from "../BodyParserMiddleware/AdminParser"
import { UserRequest } from "../BodyParserMiddleware/UserParser"
import Admin from "@models/Users/Admin"
import AdminLogic from "@controller/BusinessLogic/User/Admin/admin-logic"
import AdminLogicImpl from "@controller/BusinessLogic/User/Admin/admin-logic-impl"

const router = Router()

router.use(BlockedJWTMiddleware)
router.use(passport.authenticate('access-token', { session: false }))

router.get('/', onlyAdmins, async (req, res) => {
    const logic: StudentLogic = new StudentLogicImpl()
    const students = await logic.getAllStudents()
    res.send(students)
})

router.post('/', onlyAdmins, AdminParser, async (req, res) => {
    const request = req as UserRequest
    const logic: AdminLogic = new AdminLogicImpl()
    const student = await logic.createAdmin(request.account as Admin)
    res.send(student)
})

export default router;
