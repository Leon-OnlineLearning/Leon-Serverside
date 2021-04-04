import Joi from "joi";

export const EventValidatorSchema = Joi.object(
    {
        title: Joi.string()
            .min(5)
            .required(),
        year: Joi.number()
            .min(1)
            .required(),
        startTime: Joi.date()
            .required(),
        endTime: Joi.date()
            .required()
    }
)

export const EventPartialValidatorSchema = Joi.object(
    {
        title: Joi.string()
            .min(5),
        year: Joi.number()
            .min(1),
        startTime: Joi.date(),
        endTime: Joi.date()
    }
)