import StudentLogic from "@controller/BusinessLogic/User/Student/students-logic";
import StudentLogicImpl from "@controller/BusinessLogic/User/Student/students-logic-impl";
import Student from "@models/Users/Student";
import UserInputError from "@services/utils/UserInputError";
import express from "express";
import { getRepository } from "typeorm";
/**
 * Embedding check middleware
 * @param req
 * @param res
 * @param next
 */
export default async function studentWithNoEmbedding(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) {
    const studentLogic: StudentLogic = new StudentLogicImpl();
    try {
        const embedding = await studentLogic.getEmbedding(
            req.params["studentId"]
        );
        if (!embedding) {
            res.status(403).send({
                success: false,
                message: "student doesn't have embedding",
            });
            return;
        }
    } catch (e) {
        if (e instanceof UserInputError) {
            res.status(400).send({ success: false, message: e.message });
        } else {
            throw e;
        }
    }
    next();
}
