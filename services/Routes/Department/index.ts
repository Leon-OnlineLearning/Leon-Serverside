
import passport, { BlockedJWTMiddleware } from "@services/Auth"
import { Router } from "express"
import BodyParserMiddleware from "@services/Routes/BodyParserMiddleware/BodyParserMiddleware"
import { DepartmentParser, DepartmentRequest } from "../BodyParserMiddleware/DepartmentParser"
import DepartmentsLogic from "@controller/BusinessLogic/Department/departments-logic"
import DepartmentsLogicImpl from "@controller/BusinessLogic/Department/departments-logic-impl"
import paginationParameters from "../utils/pagination"

const router = Router()

router.use(BlockedJWTMiddleware)
router.use(passport.authenticate('access-token', { session: false }))

const parser: BodyParserMiddleware = new DepartmentParser()

router.get('/:departmentId', async (req, res) => {
    const logic: DepartmentsLogic = new DepartmentsLogicImpl()
    try {
        const department = await logic.getDepartmentById(req.params.departmentId)
        res.send(department)
    } catch (e) {
        res.status(400).send({ message: e.message, success: false })
    }
})

router.get('/', async (req, res) => {
    const logic: DepartmentsLogic = new DepartmentsLogicImpl()
    const [skip, take] = paginationParameters(req)
    try {
        const departments = await logic.getAllDepartments(skip, take)
        res.send(departments)
    } catch (e) {

    }
})

router.post('/', parser.completeParser, async (req, res) => {
    const logic: DepartmentsLogic = new DepartmentsLogicImpl()
    const depReq = req as DepartmentRequest
    try {
        const department = await logic.createDepartment(depReq.department)
        res.status(201).send(department)
    } catch (e) {
        res.status(400).send({ success: false, message: e.message })
    }
})


router.put('/:departmentId', parser.completeParser, async (req, res) => {
    const logic: DepartmentsLogic = new DepartmentsLogicImpl()
    const depReq = req as DepartmentRequest
    try {
        const d = await logic.updateDepartment(req.params.departmentId, depReq.department)
        res.send(d)
    } catch (e) {
        res.status(400).send({ success: false, message: e.message })
    }
})

router.patch('/:departmentId', parser.partialParser, async (req, res) => {
    const logic: DepartmentsLogic = new DepartmentsLogicImpl()
    const depReq = req as DepartmentRequest
    try {
        const d = await logic.updateDepartment(req.params.departmentId, depReq.department)
        res.send(d)
    } catch (e) {
        res.status(400).send({ success: false, message: e.message })
    }
})

router.delete('/:departmentId', async (req, res) => {
    const logic: DepartmentsLogic = new DepartmentsLogicImpl()
    try {
        await logic.deleteDepartment(req.params.departmentId)
        res.send({ success: true })
    } catch (e) {
        res.status(400).send({ success: false, message: e.message })
    }
})

router.get('/:departmentId/professors', async (req, res) => {
    const logic: DepartmentsLogic = new DepartmentsLogicImpl()
    try {
        const professors = await logic.getAllProfessor(req.params.departmentId)
        res.send(professors)
    } catch (e) {
        res.status(400).send({ success: false, message: e.message })
    }
})


router.get('/:departmentId/students', async (req, res) => {
    const logic: DepartmentsLogic = new DepartmentsLogicImpl()
    try {
        const students = await logic.getAllStudents(req.params.departmentId)
        res.send(students)
    } catch (e) {
        res.status(400).send({ success: false, message: e.message })
    }
})

export default router;