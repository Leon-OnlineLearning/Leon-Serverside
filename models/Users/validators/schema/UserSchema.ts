import Joi from "joi"
import { IsStrongPassword } from ".."
const UserValidationSchema = Joi.object({
    email: Joi.string()
        .email()
        .required(),
    firstName: Joi.string()
        .min(2)
        .required(),
    lastName: Joi.string()
        .min(2)
        .required(),
    password: Joi.string()
        .custom((value, helper) => {
            if (!IsStrongPassword(value)) {
                return helper.message({ custom: "password is not strong" })
            }
            return true
        })
})

export default UserValidationSchema;