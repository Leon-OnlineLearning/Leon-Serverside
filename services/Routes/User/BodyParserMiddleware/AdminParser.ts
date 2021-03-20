import Admin from "@models/Users/Admin";
import UserTypes from "@models/Users/UserTypes";
import { UserPartialValidatorSchema, UserValidationSchema } from "@models/Users/validators/schema/UserSchema";
import { Request, Response, NextFunction } from "express"
import Joi from "joi";
import BodyParserMiddleware from "./BodyParserMiddleware";
import UserParser from "./UserParser";

export class AdminParser implements BodyParserMiddleware {
   parserClosure(validationSchema: Joi.ObjectSchema) {
      return async (req: Request, res: Response, next: NextFunction) => {
         try {
            const admin: Admin  = await UserParser(validationSchema, req) as Admin
            const adminReq = req as AdminRequest
            adminReq.account = admin
            next()
            return
         } catch (e) {
            res.status(400).send({ message: e.message, success: false })
         }
      }
   }

   completeParser = this.parserClosure(UserValidationSchema)
   partialParser = this.parserClosure(UserPartialValidatorSchema)

}

export interface AdminRequest extends Request {
   account : Admin
}