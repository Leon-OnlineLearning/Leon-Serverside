import UserRepo from "@controller/DataAccess/user-repo";
import { blockId } from "@controller/tokens";
import Admin from "@models/Users/Admin";
import Professor from "@models/Users/Professor";
import Student from "@models/Users/Student";
import User from "@models/Users/User";
import UserPersistanceFactory from "@models/Users/UserFactory";
import { getConnection, Repository } from "typeorm";
import UsersLogic from "@controller/BusinessLogic/User/users-logic"


// TODO: DISCUSS: you probably want to make a less flexible higher level function instead of these which call the 
// database one more time, this performance overhead can be avoided
// example 
// instead of `createNewUser` it will be `createNewProfessor` for example 

// clone this 
// export async function createStudent(student :Student) {
//     await createNewUser(student, "student")
// }

// export async function createProfessor(professor: Professor) {
//     await createNewUser(professor, "professor")
// }

// export async function createAdmin(admin: Admin) {
//     await createNewUser(admin, "admin")
// }

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

    private async _getUserRole(id: string) {
        const _usrRepo = getConnection().getCustomRepository(UserRepo);
        return await _usrRepo.getRoleById(id)
    }

}
