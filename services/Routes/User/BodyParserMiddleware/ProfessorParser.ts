import Professor from "@models/Users/Professor";
import UserTypes from "@models/Users/UserTypes";
import UserValidationSchema from "@models/Users/validators/schema/UserSchema";
import {Request, Response, NextFunction} from "express"
import UserParser from "./UserParser";
export default async function ProfessorParser(req: Request, res: Response, next: NextFunction) {
   UserParser(UserTypes.PROFESSOR, req, res, next)
}