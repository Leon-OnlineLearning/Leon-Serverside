import { registerDecorator } from "class-validator";
import { hasOnlyExpressionInitializer } from "typescript";

/**
 * Checks if the password is strong (has alphabetic characters and at least a single number and a single non-alphanumeric character)
 */
export function IsStrongPassword(password: string) {
    const res =
        /[A-Z]/g.test(password) &&
        /[a-z]/g.test(password) &&
        /[^a-zA-Z0-9]/g.test(password) &&
        /[0-9]/g.test(password) &&
        password.length > 8;
    return res;
}
