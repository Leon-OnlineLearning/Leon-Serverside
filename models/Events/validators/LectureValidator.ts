import Joi from "joi";
import {
    EventPartialValidatorSchema,
    EventValidatorSchema,
} from "./EventValidator";

export const LectureValidatorSchema = EventValidatorSchema.keys({
    path: Joi.string().uri().required(),
});

export const LecturePartialValidatorSchema = EventPartialValidatorSchema.keys({
    path: Joi.string().uri(),
});
