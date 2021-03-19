import { Router } from "express"
import passport, { BlockedJWTMiddleware } from "@services/Auth"
import { onlyAdmins } from "../AuthorizationMiddleware"
import ProfessorLogic from "@controller/BusinessLogic/User/Professor/professors-logic"
import ProfessorLogicIml from "@controller/BusinessLogic/User/Professor/professors-logic-impl"
import ProfessorParser from "../BodyParserMiddleware/ProfessorParser"
import { UserRequest } from "../BodyParserMiddleware/UserParser"
import Professor from "@models/Users/Professor"

const router = Router()

router.use(BlockedJWTMiddleware)
router.use(passport.authenticate('access-token', { session: false }))

router.get('/', onlyAdmins, async (req, res) => {
    const logic: ProfessorLogic = new ProfessorLogicIml()
    const professors = await logic.getAllProfessors()
    res.send(professors)
})

router.post('/', onlyAdmins, ProfessorParser, async (req, res) => {
    const request = req as UserRequest
    const logic: ProfessorLogic = new ProfessorLogicIml()
    try {
        const student = await logic.createProfessor(request.account as Professor)
        res.send(student)
    } catch (e) {
        res.status(400).send({ success: false, message: e.message })
    }
})

export default router;
