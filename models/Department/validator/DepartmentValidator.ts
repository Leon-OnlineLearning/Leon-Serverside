import Joi from "joi";

export const DepartmentValidatorSchema = Joi.object(
    {
        name: Joi.string()
            .min(5)
            .required()
    }
)

export const DepartmentPartialValidatorSchema = Joi.object(
    {
        name: Joi.string()
            .min(5)
            .required()
    }
)