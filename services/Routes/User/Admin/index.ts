import { Router } from "express"
import passport, { BlockedJWTMiddleware } from "@services/Auth"
import { onlyAdmins } from "../AuthorizationMiddleware"
import StudentLogic from "@controller/BusinessLogic/User/Student/students-logic"
import StudentLogicImpl from "@controller/BusinessLogic/User/Student/students-logic-impl"
import Admin from "@models/Users/Admin"
import AdminLogic from "@controller/BusinessLogic/User/Admin/admin-logic"
import AdminLogicImpl from "@controller/BusinessLogic/User/Admin/admin-logic-impl"
import BodyParserMiddleware from "../BodyParserMiddleware/BodyParserMiddleware"
import { AdminParser, AdminRequest } from "../BodyParserMiddleware/AdminParser"
import paginationParameters from "@services/Routes/utils/pagination"

const router = Router()

router.use(BlockedJWTMiddleware)
router.use(passport.authenticate('access-token', { session: false }))

const parser: BodyParserMiddleware = new AdminParser()

router.get('/', onlyAdmins, async (req, res) => {
    const logic: AdminLogic = new AdminLogicImpl()
    const [skip, take] = paginationParameters(req)
    const students = await logic.getAllAdmins(skip, take)
    res.send(students)
})

router.post('/', onlyAdmins, parser.completeParser, async (req, res) => {
    const request = req as AdminRequest
    const logic: AdminLogic = new AdminLogicImpl()
    try {
        const admin = await logic.createAdmin(request.account as Admin)
        res.send(admin.summary())
    } catch (e) {
        res.status(400).send({ success: false, message: e.message })
    }
})

router.delete('/:adminId', onlyAdmins, async (req, res) => {
    try {
        const logic: AdminLogic = new AdminLogicImpl()
        await logic.deleteAdminById(req.params.adminId)
        res.send({ success: true })
    } catch (e) {
        res.status(400).send({ success: false, message: e.message })
    }
})

router.put('/:adminId', onlyAdmins, parser.partialParser, async (req, res) => {
    const request = req as AdminRequest
    const logic: AdminLogic = new AdminLogicImpl()
    try {
        const admin = await logic.updateAdmin(req.params.adminId, request.account)
        res.send(admin.summary())
    } catch (e) {
        res.status(400).send({ message: e.message, success: false })
    }
})

router.get("/:adminId", onlyAdmins, async (req, res) => {
    const request = req as AdminRequest
    const logic: AdminLogic = new AdminLogicImpl()
    try {
        const admin = await logic.getAdminById(req.params.adminId)
        if (!admin)
            res.status(400).send({ message: "Admin is not found", success: false })
        res.send(admin?.summary())
    } catch (e) {
        res.status(400).send({ message: e.message, success: false })
    }
})

export default router;
