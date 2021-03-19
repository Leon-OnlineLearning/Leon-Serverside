import UserTypes from "@models/Users/UserTypes";
import { UserPartialValidatorSchema, UserValidationSchema } from "@models/Users/validators/schema/UserSchema";
import { Request, Response, NextFunction } from "express"
import UserParser from "./UserParser";
export async function AdminParser(req: Request, res: Response, next: NextFunction) {
   // TODO: replecate the work in student parser
   UserParser(UserValidationSchema, req)
}

export async function AdminPartialParser(req: Request, res: Response, next: NextFunction) {
   // TODO: replecate the work in student parser
   UserParser(UserPartialValidatorSchema, req)
}
