import Joi from "joi";
import BodyParserMiddleware from "./BodyParserMiddleware";
import { Request, Response, NextFunction } from "express"
import Department from "@models/Department";
import { DepartmentPartialValidatorSchema, DepartmentValidatorSchema } from "@models/Department/validator/DepartmentValidator";

export class DepartmentParser implements BodyParserMiddleware {
    parserClosure(validatorSchema: Joi.ObjectSchema) {
        return async (req: Request, res: Response, next: NextFunction) => {
            const department = new Department()
            department.name = req.body.name
            const departmentReq = req as DepartmentRequest
            departmentReq.department = department
            try {
                await validatorSchema.validateAsync(department)
                next()
                return
            } catch (e) {
                res.status(400).send({ success: false, message: e.message })
            }
        }
    }
    completeParser = this.parserClosure(DepartmentValidatorSchema)
    partialParser = this.parserClosure(DepartmentPartialValidatorSchema)
}

export interface DepartmentRequest extends Request {
    department: Department
}