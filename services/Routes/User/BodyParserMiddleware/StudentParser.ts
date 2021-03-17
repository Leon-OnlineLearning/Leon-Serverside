import Student from "@models/Users/Student"
import UserValidationSchema from "@models/Users/validators/schema/UserSchema";
import { validate, validateOrReject } from "class-validator";
import { Request, Response, NextFunction } from "express"
export default async function StudentParser(req: Request, res: Response, next: NextFunction) {
   // todo check if all values are present
   const studentReq = req as StudentRequest
   const s: Student = new Student()
   s.firstName = req.body.firstName;
   s.lastName = req.body.lastName;
   s.email = req.body.email;
   s.password = req.body.password;
   try {
      console.log("does it come here?", s.password);
      await UserValidationSchema.validateAsync(s)
   } catch (e) {
      res.status(400).send({ success: false, message: e.message })
      return;
   }
   studentReq.student = s
   next()
}

export interface StudentRequest extends Request {
   student: Student;
}