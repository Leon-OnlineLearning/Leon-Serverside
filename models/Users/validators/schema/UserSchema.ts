import Joi from "joi";
import { IsStrongPassword } from "..";
export const UserValidationSchema = Joi.object({
    email: Joi.string().email().required(),
    firstName: Joi.string().min(2).required(),
    lastName: Joi.string().min(2).required(),
    password: Joi.string()
        .custom((value, helper) => {
            if (!IsStrongPassword(value)) {
                return helper.message({ custom: "password is not strong" });
            }
            return true;
        })
        .required(),
});

export const UserPartialValidatorSchema = Joi.object({
    email: Joi.string().email(),
    firstName: Joi.string().min(2),
    lastName: Joi.string().min(2),
    password: Joi.string().custom((value, helper) => {
        if (!IsStrongPassword(value)) {
            return helper.message({ custom: "password is not strong" });
        }
        return true;
    }),
    thirdPartyAccount: Joi.bool(),
});

export const UserThirdPartySchema = Joi.object({
    email: Joi.string().required().email(),
    firstName: Joi.string().required().min(2),
    lastName: Joi.string().required().min(2),
    thirdPartyAccount: Joi.bool().required(),
}).unknown();
