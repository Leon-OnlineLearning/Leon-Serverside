import Student from "@models/Users/Student"
import UserTypes from "@models/Users/UserTypes";
import { StudentPartialValidatorSchema, StudentValidationSchema } from "@models/Users/validators/schema/StudentSchema";
import { UserValidationSchema, UserPartialValidatorSchema } from "@models/Users/validators/schema/UserSchema";
import { Request, Response, NextFunction } from "express"
import UserParser from "./UserParser";
export async function StudentParser(req: Request, res: Response, next: NextFunction) {
   try {
      // do user validation
      const student: Student = await UserParser(UserValidationSchema,  req) as Student
      // do the rest of validation for student mandatory entries (i.e. year)
      await StudentValidationSchema.validateAsync(student)
      const studentReq = req as StudentRequest
      studentReq.account = student
      next()
      return;
   } catch (e) {
      res.status(400).send({ message: e.message, success: false })
   }
}

export async function StudentPartialParser(req: Request, res: Response, next: NextFunction) {
   try {
      const student: Student = await UserParser(UserPartialValidatorSchema,  req) as Student
      await StudentPartialValidatorSchema.validateAsync(student)
   } catch (e) {
      res.status(400).send({ message: e.message, success: false })
   }
}

export interface StudentRequest extends Request {
   account: Student
}