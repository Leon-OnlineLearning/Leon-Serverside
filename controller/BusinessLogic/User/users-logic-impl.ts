import UserRepo from "@controller/DataAccess/user-repo";
import { blockId } from "@controller/tokens";
import Admin from "@models/Users/Admin";
import Professor from "@models/Users/Professor";
import Student from "@models/Users/Student";
import User from "@models/Users/User";
import UserPersistanceFactory from "@models/Users/UserFactory";
import { getConnection, Repository } from "typeorm";
import UsersLogic from "@controller/BusinessLogic/User/users-logic"


export class UsersLogicImpl implements UsersLogic {

    async deleteUserById(userId: string): Promise<void> {
        await blockId(userId)
        const userRepo = getConnection().getCustomRepository(UserRepo)
        try {
            await userRepo.delete(userId)
        } catch (e) {
            throw e;
        }
    }

    async getUserById(userId: string): Promise<User | undefined> {
        const userRepo = getConnection().getCustomRepository(UserRepo)
        return await userRepo.findOne(userId)
    }

    updateUserPrivileges(userId: string, newRole: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}
