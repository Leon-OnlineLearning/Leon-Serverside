import User from "@models/Users/User";
import UserClassFactory from "@models/Users/UserClassMapper";
import UserTypes from "@models/Users/UserTypes";
import { Request, Response, NextFunction } from "express";
import Joi from "joi";

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
export default async function UserParser(validatorSchema: Joi.ObjectSchema, req: Request): Promise<User> {
    let usr: any = {};
    usr.firstName = req.body.firstName;
    usr.lastName = req.body.lastName;
    usr.email = req.body.email;
    usr.password = req.body.password;
    try {
        await validatorSchema.validateAsync(usr)
        return usr
    } catch (e) {
        throw e
    }
}
