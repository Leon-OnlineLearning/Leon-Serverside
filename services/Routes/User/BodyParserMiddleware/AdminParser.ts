import UserTypes from "@models/Users/UserTypes";
import {Request, Response, NextFunction} from "express"
import UserParser from "./UserParser";
export default async function AdminParser(req: Request, res: Response, next: NextFunction) {
   UserParser(UserTypes.ADMIN, req, res, next)
}