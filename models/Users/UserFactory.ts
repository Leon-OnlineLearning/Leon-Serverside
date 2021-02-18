import { comparePasswords } from "@utils/passwords";
import { getRepository, Repository } from "typeorm";
import Admin from "./Admin";
import Professor from "./Professor";
import Student from "./Student";
import User from "./User";

/**
 * return a new user depending on the role provided
 * 
 * @param {string | undefined} role account's privileges group
 */
export default function UserPersistanceFactory(role?: string): [Repository<Student | Admin | Professor>, Student | Admin | Professor] {
    if (!role) return [getRepository(Student), new Student()];
    const comparableRole = role.toLocaleLowerCase()
    if (comparableRole === "professor") {
        return [getRepository(Professor), new Professor()];
    } else if (comparableRole === "admin") {
        return [getRepository(Admin), new Admin()];
    } else {
        return [getRepository(Student), new Student()];
    }
}