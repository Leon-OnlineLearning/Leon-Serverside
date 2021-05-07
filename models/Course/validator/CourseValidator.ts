import Joi from "joi";

export const CourseValidatorSchema = Joi.object({
    name: Joi.string().min(5).required(),
    year: Joi.number().min(1).required(),
    department: Joi.object().required(),
});

export const CoursePartialValidatorSchema = Joi.object({
    name: Joi.string().min(5),
    year: Joi.number().min(1),
    department: Joi.object(),
});
