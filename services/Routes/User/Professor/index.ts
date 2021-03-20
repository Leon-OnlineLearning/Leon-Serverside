import { Router } from "express"
import passport, { BlockedJWTMiddleware } from "@services/Auth"
import { onlyAdmins } from "../AuthorizationMiddleware"
import ProfessorLogic from "@controller/BusinessLogic/User/Professor/professors-logic"
import ProfessorLogicIml from "@controller/BusinessLogic/User/Professor/professors-logic-impl"
import ProfessorParser, { ProfessorRequest } from "../BodyParserMiddleware/ProfessorParser"
import Professor from "@models/Users/Professor"
import BodyParserMiddleware from "../BodyParserMiddleware/BodyParserMiddleware"

const router = Router()
router.use(BlockedJWTMiddleware)
router.use(passport.authenticate('access-token', { session: false }))

const parser: BodyParserMiddleware = new ProfessorParser()

router.get('/', onlyAdmins, async (req, res) => {
    const logic: ProfessorLogic = new ProfessorLogicIml()
    const professors = await logic.getAllProfessors()
    res.send(professors)
})

router.post('/', onlyAdmins, parser.completeParser, async (req, res) => {
    const request = req as ProfessorRequest
    const logic: ProfessorLogic = new ProfessorLogicIml()
    try {
        const professor = await logic.createProfessor(request.account as Professor)
        res.send(professor)
    } catch (e) {
        res.status(400).send({ success: false, message: e.message })
    }
})

export default router;
