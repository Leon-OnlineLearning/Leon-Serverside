import Joi from "joi";
import BodyParserMiddleware from "./BodyParserMiddleware";
import { Request, Response, NextFunction } from "express";
import {
    LecturePartialValidatorSchema,
    LectureValidatorSchema,
} from "@models/Events/validators/LectureValidator";
import Lecture from "@models/Events/Lecture/Lecture";
import UserInputError from "@services/utils/UserInputError";

export default class LectureParser implements BodyParserMiddleware {
    parserClosure(validatorSchema: Joi.ObjectSchema) {
        return async (req: Request, res: Response, next: NextFunction) => {
            const lecture = new Lecture();
            lecture.startTime = new Date(req.body.startTime);
            lecture.endTime = new Date(req.body.endTime);
            if (lecture.endTime < lecture.startTime) {
                throw new UserInputError(
                    "lecture end time cannot be earlier than lecture start time"
                );
            }
            lecture.path = `${process.env["SERVER_BASE_DOMAIN"]}:${process.env["SERVER_PORT"]}/lectruesFiles/${req.file.filename}`;
            console.debug("lecture path is", lecture.path);
            lecture.title = req.body.title;
            lecture.duration =
                (lecture.endTime.getTime() - lecture.startTime.getTime()) /
                (1000 * 60); // to get it from ms to mins
            const lectureReq = req as LectureRequest;
            try {
                await validatorSchema.validateAsync(lecture);
                lectureReq.lecture = lecture;
                next();
                return;
            } catch (e: any) {
                res.status(400).send({ success: false, message: e.message });
            }
        };
    }
    completeParser = this.parserClosure(LectureValidatorSchema);
    partialParser = this.parserClosure(LecturePartialValidatorSchema);
}

export interface LectureRequest extends Request {
    lecture: Lecture;
}
