/**
 * Middlewares for authorization 
 */

import UserTypes from "@models/Users/UserTypes";
import { NextFunction, Request, Response } from "express";
import UserPrivileges from "./UserPrivilege";

export function onlyAdmins(req: Request, res: Response, next: NextFunction) {
    const requestUser: any = req.user;
    if (!isCorrectRole(requestUser, UserTypes.ADMIN)) {
        res.status(401).json({ success: false, message: "Access denied" })
    } else {
        next()
    }
}

export function onlyProfessors(req: Request, res: Response, next: NextFunction) {
    const requestUser: any = req.user;
    
    if (!isCorrectRole(requestUser, UserTypes.PROFESSOR)) {
        res.status(401).json({ success: false, message: "Access denied" })
    } else {
        next()
    }
}

export function onlyStudents(req: Request, res: Response, next: NextFunction) {
    const requestUser: any = req.user;
    if (!isCorrectRole(requestUser, UserTypes.STUDENT)) {
        res.send(401).json({ success: false, message: "Access denied" })
    }
}

function isCorrectRole(user: any, role: UserTypes) {
    const comparableString: string = (<string>user.role).toLowerCase();
    // now if the privilege is admin he can access professors 
    return UserPrivileges[role].find((r: UserTypes) => r === comparableString)
}
