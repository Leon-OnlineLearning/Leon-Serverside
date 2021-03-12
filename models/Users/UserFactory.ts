import { comparePasswords } from "@utils/passwords";
import { getRepository, Repository } from "typeorm";
import Admin from "./Admin";
import Professor from "./Professor";
import Student from "./Student";
import User from "./User";
import UserTypes from "./UserTypes";

/**
 * @deprecated
 * Not supported after refactor 82f2c25b349417c0b4a3a01657dc7f336dc03b77
 * REASONING: This function was used only because you have to pass the actual 
 * subclass to typeorm repo to work correctly.
 * This is bad, because every time we will add a new user probably service user
 * we will have to change this too and add another case we have to check which 
 * means more bugs we have to face.
 * 
 * For documentation about how to use the new approach please refer to the commit 
 * mentioned above.
 * 
 * @param {string | undefined} role account's privileges group
 */
export default function UserPersistanceFactory(role?: string): [Repository<Student | Admin | Professor>, Student | Admin | Professor] {
    if (!role) return [getRepository(Student), new Student()];
    const comparableRole = role.toLocaleLowerCase()
    if (comparableRole === UserTypes.PROFESSOR) {
        return [getRepository(Professor), new Professor()];
    } else if (comparableRole === UserTypes.ADMIN) {
        return [getRepository(Admin), new Admin()];
    } else {
        return [getRepository(Student), new Student()];
    }
}