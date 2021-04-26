import Joi from "joi";

export const StudentValidationSchema = Joi.object({
    year: Joi.number().min(0).required(),
    department: Joi.object().required(),
}).unknown();

export const StudentPartialValidatorSchema = Joi.object({
    year: Joi.number().min(0),
    department: Joi.object().required(),
}).unknown();
