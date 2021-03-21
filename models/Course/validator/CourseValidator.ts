import Joi from "joi";

export const CourseValidatorSchema = Joi.object(
    {
        name: Joi.string()
            .min(5)
            .required()
    }
)

export const CoursePartialValidatorSchema = Joi.object(
    {
        name: Joi.string()
            .min(5)
            .required()
    }
)