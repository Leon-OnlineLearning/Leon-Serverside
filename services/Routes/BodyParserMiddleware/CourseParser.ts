import Joi from "joi";
import BodyParserMiddleware from "./BodyParserMiddleware";
import {Request, Response, NextFunction} from "express"
import Course from "@models/Course";
import { CoursePartialValidatorSchema, CourseValidatorSchema } from "@models/Course/validator/CourseValidator";

export class CourseParser implements BodyParserMiddleware {
    parserClosure(validatorSchema: Joi.ObjectSchema) {
        return async (req: Request, res: Response, next: NextFunction) => {
            const course = new Course()
            course.name = req.body.name
            const courseReq = req as CourseRequest
            courseReq.course = course
            try {
                await validatorSchema.validateAsync(course)
                next()
                return
            } catch (e) {
                res.status(400).send({ success: false, message: e.message })
            }
        }
    }
    completeParser = this.parserClosure(CourseValidatorSchema)
    partialParser = this.parserClosure(CoursePartialValidatorSchema)
}

export interface CourseRequest extends Request{
    course: Course
}