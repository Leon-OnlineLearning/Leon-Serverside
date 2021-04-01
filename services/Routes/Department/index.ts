
import passport, { BlockedJWTMiddleware } from "@services/Auth"
import { Router } from "express"
import BodyParserMiddleware from "@services/Routes/BodyParserMiddleware/BodyParserMiddleware"
import { DepartmentParser, DepartmentRequest } from "../BodyParserMiddleware/DepartmentParser"
import DepartmentsLogic from "@controller/BusinessLogic/Department/departments-logic"
import DepartmentsLogicImpl from "@controller/BusinessLogic/Department/departments-logic-impl"
import paginationParameters from "../utils/pagination"
import simpleFinalMWDecorator from "@services/utils/RequestDecorator"

const router = Router()

router.use(BlockedJWTMiddleware)
router.use(passport.authenticate('access-token', { session: false }))

const parser: BodyParserMiddleware = new DepartmentParser()

router.get('/:departmentId', async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: DepartmentsLogic = new DepartmentsLogicImpl()
        const department = await logic.getDepartmentById(req.params.departmentId)
        return department
    })
})

router.get('/', async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: DepartmentsLogic = new DepartmentsLogicImpl()
        const [skip, take] = paginationParameters(req)
        const departments = await logic.getAllDepartments(skip, take)
        return departments
    })
})

router.post('/', parser.completeParser, async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: DepartmentsLogic = new DepartmentsLogicImpl()
        const depReq = req as DepartmentRequest
        const department = await logic.createDepartment(depReq.department)
        return department
    }, 201)
})


router.put('/:departmentId', parser.completeParser, async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: DepartmentsLogic = new DepartmentsLogicImpl()
        const depReq = req as DepartmentRequest
        const d = await logic.updateDepartment(req.params.departmentId, depReq.department)
        return d
    })
})

router.patch('/:departmentId', parser.partialParser, async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: DepartmentsLogic = new DepartmentsLogicImpl()
        const depReq = req as DepartmentRequest
        const d = await logic.updateDepartment(req.params.departmentId, depReq.department)
        return d;
    })
})

router.delete('/:departmentId', async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: DepartmentsLogic = new DepartmentsLogicImpl()
        await logic.deleteDepartment(req.params.departmentId)
    }, 204)
})

router.get('/:departmentId/professors', async (req, res) => {
    simpleFinalMWDecorator(res, async ()=>{
        const logic: DepartmentsLogic = new DepartmentsLogicImpl()
        const professors = await logic.getAllProfessor(req.params.departmentId)
        return professors
    })
})


router.get('/:departmentId/students', async (req, res) => {
    simpleFinalMWDecorator(res,async () => {
        const logic: DepartmentsLogic = new DepartmentsLogicImpl()
        const students = await logic.getAllStudents(req.params.departmentId)
        return students
    })
})

router.post('/:departmentId/professors', async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: DepartmentsLogic = new DepartmentsLogicImpl()
        await logic.addProfessorToDepartment(req.params.departmentId,req.body.professorId)
    })
})

export default router;