import Joi from "joi";
import BodyParserMiddleware from "./BodyParserMiddleware";
import { Request, Response, NextFunction } from "express"
import { LecturePartialValidatorSchema, LectureValidatorSchema } from "@models/Events/validators/LectureValidator";
import Lecture from "@models/Events/Lecture";
import Exam from "@models/Events/Exam";

export default class ExamParser implements BodyParserMiddleware {
    parserClosure(validatorSchema: Joi.ObjectSchema) {
        return async (req: Request, res: Response, next: NextFunction) => {
            const exam = new Exam()
            exam.startTime = new Date(req.body.eventTime)
            exam.mark = req.body.mark
            exam.title = req.body.title
            const examReq = req as ExamRequest 
            examReq.exam = exam
            try {
                await validatorSchema.validateAsync(exam)
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

export interface ExamRequest extends Request{
    exam  : Exam
}