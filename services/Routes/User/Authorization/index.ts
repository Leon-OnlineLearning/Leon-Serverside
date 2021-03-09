/**
 * Middlewares for authorization 
 */

import UserTypes from "@models/Users/UserTypes";
import { NextFunction, Request, Response } from "express";
import UserPrivileges from "./UserPrivilage";

export function onlyAdmins(req: Request, res: Response, next: NextFunction) {
    comparingRoles(req, res, UserTypes.ADMIN)
    next()
}

export function onlyProfessors(req: Request, res: Response, next: NextFunction) {
    comparingRoles(req, res, UserTypes.PROFESSOR)
    next()
}

function comparingRoles(req: Request, res: Response, role: UserTypes) {
    const requestUser: any = req.user;
    if (!isCorrectRole(requestUser, role)) {
        res.status(400).json({ success: false, message: "Access denied" })
    }
}

function isCorrectRole(user: any, role: UserTypes) {
    const comparableString: string = (<string>user.role).toLowerCase();
    // now if the privilege is admin he can access professors 
    return UserPrivileges[role].find((r: UserTypes) => r === comparableString)
}
