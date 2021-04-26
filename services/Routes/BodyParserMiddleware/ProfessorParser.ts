import Professor from "@models/Users/Professor";
import UserTypes from "@models/Users/UserTypes";
import {
    UserValidationSchema,
    UserPartialValidatorSchema,
} from "@models/Users/validators/schema/UserSchema";
import { Request, Response, NextFunction } from "express";
import UserParser from "./UserParser";
import BodyParserMiddleware from "./BodyParserMiddleware";
import Joi from "joi";
export default class ProfessorParser implements BodyParserMiddleware {
    parserClosure(validationSchema: Joi.ObjectSchema) {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                const professor: Professor = (await UserParser(
                    validationSchema,
                    req
                )) as Professor;
                const professorReq = req as ProfessorRequest;
                professorReq.account = professor;
                next();
                return;
            } catch (e) {
                res.status(400).send({ message: e.message, success: false });
            }
        };
    }
    completeParser = this.parserClosure(UserValidationSchema);
    partialParser = this.parserClosure(UserPartialValidatorSchema);
}
export interface ProfessorRequest extends Request {
    account: Professor;
}
