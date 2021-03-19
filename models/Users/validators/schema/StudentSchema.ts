
import Joi from "joi"

export const StudentValidationSchema = Joi.object({
    year: Joi.number().min(0).required()
})

export const StudentPartialValidatorSchema = Joi.object({
    year: Joi.number().min(0)
})

