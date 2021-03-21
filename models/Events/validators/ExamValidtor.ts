import Joi from "joi";
import { EventPartialValidatorSchema, EventValidatorSchema } from "./EventValidator";

export const ExamValidatorSchema = EventValidatorSchema.keys(
    {
        mark: Joi.number()
            .min(1)
            .required()
    }
)

export const ExamPartialValidatorSchema = EventPartialValidatorSchema.keys(
    {
        mark: Joi.number()
            .min(1)
    }
)