import Joi from "joi";
import BodyParserMiddleware from "./BodyParserMiddleware";
import { Request, Response, NextFunction } from "express"
import { LecturePartialValidatorSchema, LectureValidatorSchema } from "@models/Events/validators/LectureValidator";
import Lecture from "@models/Events/Lecture";
import Exam from "@models/Events/Exam";
import { ExamPartialValidatorSchema, ExamValidatorSchema } from "@models/Events/validators/ExamValidtor";

export default class ExamParser implements BodyParserMiddleware {
    parserClosure(validatorSchema: Joi.ObjectSchema) {
        return async (req: Request, res: Response, next: NextFunction) => {
            const exam = new Exam()
            exam.startTime = new Date(req.body.startTime)
            console.log(req.body);
            exam.endTime = new Date(req.body.endTime)
            exam.mark = req.body.mark
            exam.title = req.body.title
            exam.year = req.body.year
            exam.mark = req.body.mark
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
    completeParser = this.parserClosure(ExamValidatorSchema)
    partialParser = this.parserClosure(ExamPartialValidatorSchema)
}

export interface ExamRequest extends Request {
    exam: Exam
}