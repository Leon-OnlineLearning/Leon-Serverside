/**
 * Questions you might have regarding this interface
 * - Q: Why XRequest in not generalized?
 *   A: Because ORM need to know the actual type so i preferred to make it
 *      the responsibility of implementors
 */

import { Request, Response, NextFunction } from "express";
import Joi from "joi";
export default interface BodyParserMiddleware {
    completeParser(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void>;
    partialParser(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void>;
    parserClosure(
        validationSchema: Joi.ObjectSchema
    ): (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
