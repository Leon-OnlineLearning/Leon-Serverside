import User from "@models/Users/User";
import UserClassFactory from "@models/Users/UserClassMapper";
import UserTypes from "@models/Users/UserTypes";
import UserValidationSchema from "@models/Users/validators/schema/UserSchema";

import { Request, Response, NextFunction } from "express";

/**
 * User parser is a semi middleware (used by wrappers) that take the middleware parameters + UserType
 * add field called "account" to it if all the fields for creating users exist and 
 * valid. 
 * 
 * see also StudentParser, ProfessorParser, AdminParser
 * @param usrType 
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
export default async function UserParser(usrType: UserTypes, req: Request, res: Response, next: NextFunction) {
    const UserClass = UserClassFactory(usrType)
    const usr = new UserClass()
    const usrReq = req as UserRequest
    usr.firstName = req.body.firstName;
    usr.lastName = req.body.lastName;
    usr.email = req.body.email;
    usr.password = req.body.password;
    try {
        await UserValidationSchema.validateAsync(usr)
    } catch (e) {
        res.status(400).send({ success: false, message: e.message })
        return;
    }
    usrReq.account = usr
    next()
}

export interface UserRequest extends Request {
    account: User ; // user is preserved for passport
}