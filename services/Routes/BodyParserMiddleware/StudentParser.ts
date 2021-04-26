import Student from "@models/Users/Student";
import UserTypes from "@models/Users/UserTypes";
import {
    StudentPartialValidatorSchema,
    StudentValidationSchema,
} from "@models/Users/validators/schema/StudentSchema";
import {
    UserValidationSchema,
    UserPartialValidatorSchema,
} from "@models/Users/validators/schema/UserSchema";
import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import UserParser from "./UserParser";
import BodyParserMiddleware from "./BodyParserMiddleware";
import DepartmentsLogicImpl from "@controller/BusinessLogic/Department/departments-logic-impl";

export class StudentParser implements BodyParserMiddleware {
    parserClosure(validationSchema: Joi.ObjectSchema) {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                // do user validation
                const student: Student = (await UserParser(
                    UserValidationSchema,
                    req
                )) as Student;
                student.year = req.body.year;
                const depLogic = new DepartmentsLogicImpl();
                // TODO ineffeciency spotted 😩
                student.department = await depLogic.getDepartmentById(
                    req.body.departmentId
                );
                // do the rest of validation for student mandatory entries (i.e. year)
                await validationSchema.validateAsync(student);
                const studentReq = req as StudentRequest;
                studentReq.account = student;
                next();
                return;
            } catch (e) {
                res.status(400).send({ message: e.message, success: false });
            }
        };
    }
    completeParser = this.parserClosure(StudentValidationSchema);
    partialParser = this.parserClosure(StudentPartialValidatorSchema);
}

export interface StudentRequest extends Request {
    account: Student;
}
