import Joi from "joi";
import {
    EventPartialValidatorSchema,
    EventValidatorSchema,
} from "./EventValidator";

export const ExamValidatorSchema = EventValidatorSchema.keys({
    mark: Joi.number().min(1).required(),
    professor: Joi.object().required(),
    course: Joi.object().required(),
    questions: Joi.array().items(Joi.object().required()),
});

export const ExamPartialValidatorSchema = EventPartialValidatorSchema.keys({
    mark: Joi.number().min(1),
});
