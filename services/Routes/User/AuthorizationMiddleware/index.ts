/**
 * Middlewares for authorization
 */

import UserTypes from "@models/Users/UserTypes";
import { NextFunction, Request, Response } from "express";
import UserPrivileges from "./UserPrivilege";

export function onlyAdmins(req: Request, res: Response, next: NextFunction) {
    const requestUser: any = req.user;
    if (!hasPrivilege(requestUser, UserTypes.ADMIN)) {
        res.status(401).json({ success: false, message: "Access denied" });
    } else {
        next();
    }
}

/**
 * Professors and admins can access this
 * 
 * @param req 
 * @param res 
 * @param next 
 */
export function onlyProfessors(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const requestUser: any = req.user;

    if (!hasPrivilege(requestUser, UserTypes.PROFESSOR)) {
        res.status(401).json({ success: false, message: "Access denied" });
    } else {
        next();
    }
}

/**
 * Students and admins can access this
 * 
 * @param req 
 * @param res 
 * @param next 
 */
export function onlyStudents(req: Request, res: Response, next: NextFunction) {
    const requestUser: any = req.user;
    if (!hasPrivilege(requestUser, UserTypes.STUDENT)) {
        res.send(401).json({ success: false, message: "Access denied" });
    } else {
        next();
    }
}

export function onlyStudentOrProfessor(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const requestUser: any = req.user;
    const isStudent = hasPrivilege(requestUser, UserTypes.STUDENT);
    const isProfessor = hasPrivilege(requestUser, UserTypes.PROFESSOR);
    if (isStudent || isProfessor) {
        next();
    } else {
        res.send(401).json({ success: false, message: "Access denied" });
    }
}

function hasPrivilege(user: any, role: UserTypes) {
    const comparableString: string = (<string>user.role).toLowerCase();
    // now if the privilege is admin he can access professors
    return UserPrivileges[role].find((r: UserTypes) => r === comparableString);
}
