import Student from "@models/Users/Student"
import UserTypes from "@models/Users/UserTypes";
import UserValidationSchema from "@models/Users/validators/schema/UserSchema";
import { Request, Response, NextFunction } from "express"
import UserParser from "./UserParser";
export default async function StudentParser(req: Request, res: Response, next: NextFunction) {
   UserParser(UserTypes.STUDENT, req, res, next)
}
