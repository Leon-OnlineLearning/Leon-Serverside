/**
 * Middlewares for authorization 
 */

import { NextFunction, Request, Response } from "express";

export function onlyAdmins(req: Request, res: Response, next: NextFunction) {
    comparingRoles(req,res)
    next()
}

export function onlyProfessors(req: Request, res: Response, next: NextFunction) {
    comparingRoles(req,res)
    next()
}

function comparingRoles(req: Request, res: Response) {
    const requestUser: any = req.user;
    if (!isCorrectRole(requestUser, "admin")) {
        res.status(400).json({ success: false, message: "Access denied" })
    }
}

function isCorrectRole(user: any, role: string) {
    const comparableString: string = (<string>user.role).toLowerCase();
    return comparableString === role.toLowerCase()
}
