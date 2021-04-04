import { Request, Router } from "express"
import passport, { BlockedJWTMiddleware } from "@services/Auth"
import { onlyAdmins, onlyStudents } from "../AuthorizationMiddleware"
import StudentLogic from "@controller/BusinessLogic/User/Student/students-logic"
import StudentLogicImpl from "@controller/BusinessLogic/User/Student/students-logic-impl"
import { StudentParser, StudentRequest } from "../../BodyParserMiddleware/StudentParser"
import Student from "@models/Users/Student"
import BodyParserMiddleware from "../../BodyParserMiddleware/BodyParserMiddleware"
import paginationParameters from "@services/Routes/utils/pagination"
import simpleFinalMWDecorator from "@services/utils/RequestDecorator"
import DepartmentsLogicImpl from "@controller/BusinessLogic/Department/departments-logic-impl"

const router = Router()
router.use(BlockedJWTMiddleware)
router.use(passport.authenticate('access-token', { session: false }))

const parser: BodyParserMiddleware = new StudentParser()

/**
 * expected: naive pagination
 * /students?page=2&size=10
 */
router.get('/', onlyAdmins, async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: StudentLogic = new StudentLogicImpl()
        const [skip, take] = paginationParameters(req)
        const students = await logic.getAllStudents(skip, take)
        return students
    })
})

router.post('/', onlyAdmins, parser.completeParser, async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const request = req as StudentRequest
        const logic: StudentLogic = new StudentLogicImpl()
        const studentData = request.account
        const depLogic = new DepartmentsLogicImpl()
        const department = await depLogic.getDepartmentById(req.body.departmentId)
        studentData.department = department
        const _student = await logic.createStudent(studentData)
        const student = new Student()
        student.setValuesFromJSON(_student)
        
        return student.summary()
    }, 201)
})

router.put('/:studentId', parser.completeParser, async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const request = req as StudentRequest
        const logic: StudentLogic = new StudentLogicImpl()
        const student = await logic.updateStudent(req.params.studentId, request.account as Student)
        return student.summary()
    })
})

router.patch('/:studentId', onlyStudents, parser.partialParser, async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const request = req as StudentRequest
        const logic: StudentLogic = new StudentLogicImpl()
        const student = await logic.updateStudent(req.params.studentId, request.account as Student)
        return student.summary()
    })
})

router.post('/:studentId/lectures', async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: StudentLogic = new StudentLogicImpl()
        await logic.attendLecture(req.params.studentId, req.body.lectureId)
    }, 201)
})

router.get('/:studentId/lectures', async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: StudentLogic = new StudentLogicImpl()
        const lectures = await logic.getAllLectures(req.params.studentId)
        return lectures
    })
})

router.post('/:studentId/exams', async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: StudentLogic = new StudentLogicImpl()
        await logic.attendExam(req.params.studentId, req.body.examId)
    }, 201)
})

router.get('/:studentId/courses', async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: StudentLogic = new StudentLogicImpl()
        const courses = await logic.getAllCourses(req.params.studentId)
        return courses
    })
})

router.post('/:studentId/courses', async (req, res) => {
    if (req.body.course) {
        res.send(400).send({ success: false, message: "Request body doesn't include 'Course Id'" })
    }
    simpleFinalMWDecorator(res, async () => {
        const logic: StudentLogic = new StudentLogicImpl()
        await logic.addCourse(req.params.studentId, req.body.course)
    }, 201)
})

router.delete('/:studentId/courses', async (req, res) => {
    if (req.body.courseId)
        res.status(400).send({ success: false, message: "Request body doesn't include 'Course Id'" })
    simpleFinalMWDecorator(res, async () => {
        const logic: StudentLogic = new StudentLogicImpl()
        await logic.cancelCourse(req.params.studentId, req.body.courseId)
    })
})

router.get('/:studentId/events', async (req, res)=>{
    simpleFinalMWDecorator(res, async()=>{
        const logic : StudentLogic = new StudentLogicImpl()
        return logic.getAllEvents(req.params.studentId)
    })
})

export default router;
