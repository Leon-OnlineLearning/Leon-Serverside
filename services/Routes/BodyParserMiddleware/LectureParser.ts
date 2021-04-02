import Joi from "joi";
import BodyParserMiddleware from "./BodyParserMiddleware";
import { Request, Response, NextFunction } from "express"
import { LecturePartialValidatorSchema, LectureValidatorSchema } from "@models/Events/validators/LectureValidator";
import Lecture from "@models/Events/Lecture";

export default class LectureParser implements BodyParserMiddleware {
    parserClosure(validatorSchema: Joi.ObjectSchema) {
        return async (req: Request, res: Response, next: NextFunction) => {
            const lecture = new Lecture()
            lecture.eventTime = new Date(req.body.eventTime)
            lecture.path = req.body.path
            lecture.title = req.body.title
            lecture.year = req.body.year
            const lectureReq = req as LectureRequest
            try {
                await validatorSchema.validateAsync(lecture)
                lectureReq.lecture = lecture
                next()
                return
            } catch (e) {
                res.status(400).send({ success: false, message: e.message })
            }
        }
    }
    completeParser = this.parserClosure(LectureValidatorSchema)
    partialParser = this.parserClosure(LecturePartialValidatorSchema)
}

export interface LectureRequest extends Request {
    lecture: Lecture
}