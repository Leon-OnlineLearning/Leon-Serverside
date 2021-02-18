import Admin from "./Admin";
import Professor from "./Professor";
import Student from "./Student";
import User from "./User";

/**
 * return a new user depending on the role provided
 * 
 * @param {string | undefined} role account's privileges group
 */
export default function UserFactory(role?: string): User {
    let user
    if (!role) return new Student();
    if (role === "professor") {
        user = new Professor();
    } else if (role === "admin") {
        user = new Admin();
    } else {
        user = new Student();
    }
    return user
}