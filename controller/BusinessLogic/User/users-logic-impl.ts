import UserRepo from "@controller/DataAccess/user-repo";
import { blockId } from "@controller/Tokens";
import Admin from "@models/Users/Admin";
import Professor from "@models/Users/Professor";
import Student from "@models/Users/Student";
import User from "@models/Users/User";
import UserPersistanceFactory from "@models/Users/UserFactory";
import { getConnection, Repository } from "typeorm";
import UsersLogic from "@controller/BusinessLogic/User/users-logic"


export class UsersLogicImpl implements UsersLogic {

    async getUserById(userId: string): Promise<User | undefined> {
        const userRepo = new UserRepo()
        const userAndRole = await userRepo.findUserAndRoleById(userId)
        const { role, ...user } = userAndRole
        if (role === "student") {
            const res = new Student()
            res.setValuesFromJSON(user)
            return res
        } 
        if (role === "admin") {
            const res = new Admin()
            res.setValuesFromJSON(user)
            return res
        }
        if (role === "professor") {
            const res = new Professor()
            res.setValuesFromJSON(user)
            return res
        } else {
            throw new Error("Invalid role");
            
        }
    }

    updateUserPrivileges(userId: string, newRole: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}
