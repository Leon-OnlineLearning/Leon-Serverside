import Professor from "@models/Users/Professor";
import UserTypes from "@models/Users/UserTypes";
import { UserValidationSchema, UserPartialValidatorSchema } from "@models/Users/validators/schema/UserSchema";
import { Request, Response, NextFunction } from "express"
import UserParser from "./UserParser";
export async function ProfessorParser(req: Request, res: Response, next: NextFunction) {
   // TODO: replecate the work in student parser
   // TODO fix these errors
   try {
      const professor: Professor = await UserParser(UserValidationSchema, req) as Professor
      await ProfessorValidationSchema.validateAsync(professor)
      const professorReq = req as ProfessorRequest
      professorReq.account = professor
      next()
      return
   } catch (e) {
      res.status(400).send({ message: e.message, success: false })
   }
}

export async function ProfessorPartialParser(req: Request, res: Response, next: NextFunction) {
   // TODO: replecate the work in student parser
   UserParser(UserPartialValidatorSchema, req)
}