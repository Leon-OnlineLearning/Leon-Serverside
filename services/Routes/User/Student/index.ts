import { Router } from "express"
import passport, { BlockedJWTMiddleware } from "@services/Auth"
import { onlyAdmins } from "../AuthorizationMiddleware"
import StudentLogic from "@controller/BusinessLogic/User/Student/students-logic"
import StudentLogicImpl from "@controller/BusinessLogic/User/Student/students-logic-impl"

const router = Router()

router.use(BlockedJWTMiddleware)
router.use(passport.authenticate('access-token', { session: false }))

router.get('/', onlyAdmins, async (req, res) => {
    const logic : StudentLogic = new StudentLogicImpl()
    const students = await logic.getAllStudents()
    res.send(students)
})

export default router;
