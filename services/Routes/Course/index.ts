
import passport, { BlockedJWTMiddleware } from "@services/Auth"
import { Router } from "express"
import BodyParserMiddleware from "@services/Routes/BodyParserMiddleware/BodyParserMiddleware"
import { CourseParser, CourseRequest } from "../BodyParserMiddleware/CourseParser"
import CoursesLogic from "@controller/BusinessLogic/Course/courses-logic"
import CourseLogicImpl from "@controller/BusinessLogic/Course/courses-logic-impl"
import { onlyProfessors } from "../User/AuthorizationMiddleware"

const router = Router()

router.use(BlockedJWTMiddleware)
router.use(passport.authenticate('access-token', { session: false }))

const parser: BodyParserMiddleware = new CourseParser()

router.get('/:courseId', async (req, res) => {
    const logic: CoursesLogic = new CourseLogicImpl()
    try {
        const course = await logic.getCoursesById(req.params.courseId)
        res.send(course)
    } catch (e) {
        res.status(400).send({ message: e.message, success: false })
    }
})

router.post('/', parser.completeParser, async (req, res) => {
    const logic: CoursesLogic = new CourseLogicImpl()
    const courseReq = req as CourseRequest
    try {
        const course = await logic.createCourse(courseReq.course)
        res.send(course)
    } catch (e) {
        res.status(400).send({ message: e.message, success: false })
    }
})

router.put('/:courseId', parser.completeParser, async (req, res) => {
    const logic: CoursesLogic = new CourseLogicImpl()
    const courseReq = req as CourseRequest
    try {
        const course = await logic.updateCourse(req.params.courseId, courseReq.course)
        res.send(course)
    } catch (e) {
        res.status(400).send({ message: e.message, success: false })
    }
})

router.patch('/:courseId', parser.partialParser, async (req, res) => {
    const logic: CoursesLogic = new CourseLogicImpl()
    const courseReq = req as CourseRequest
    try {
        const course = await logic.updateCourse(req.params.courseId, courseReq.course)
        res.send(course)
    } catch (e) {
        res.status(400).send({ message: e.message, success: false })
    }
})

router.delete('/:courseId', async (req, res) => {
    const logic: CoursesLogic = new CourseLogicImpl()
    try {
        await logic.deleteCourseById(req.params.courseId)
        res.send({ success: true })
    } catch (e) {
        res.status(400).send({ message: e.message, success: false })
    }
})

router.get('/:courseId/stats', onlyProfessors, async (req, res) => {
    const logic: CoursesLogic = new CourseLogicImpl()
    try {
        const stats = await logic.getLecturesStatistics(req.params.courseId)
        res.send(stats)
    } catch (e) {
        res.status(400).send({ message: e.message, success: false })
    }
})
export default router;