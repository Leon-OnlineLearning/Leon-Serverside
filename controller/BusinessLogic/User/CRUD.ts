import UserRepo from "@controller/DataAccess/user-repo";
import { blockId } from "@controller/tokens";
import Admin from "@models/Users/Admin";
import Professor from "@models/Users/Professor";
import Student from "@models/Users/Student";
import User from "@models/Users/User";
import UserPersistanceFactory from "@models/Users/UserFactory";
import { getConnection, Repository } from "typeorm";

// TODO: DISCUSS: you probably want to make a less flexible higher level function instead of these which call the 
// database one more time, this performance overhead can be avoided
// example 
// instead of `createNewUser` it will be `createNewProfessor` for example 

export async function createNewUser(user: User, role: string) {
    const [userRepo, newUserObj] = UserPersistanceFactory(role);
    try {
        newUserObj.setValuesFromUser(user)
        await userRepo.save(newUserObj);
    } catch (e) {
        throw e;
    }
    // throw new Error("create user not implemented");
    return newUserObj;
}

/**
 * Update user data only, not concerned with privileges 
 * For privileges see updateUserPrivileges
 * @param userId 
 * @param newUser 
 */
export async function updateUser(userId: string, newUser: User) {

    const role = await _getUserRole(userId)
    const [userRepo, newUserObj] = UserPersistanceFactory(role);
    try {
        newUserObj.setValuesFromUser(newUser)
        await userRepo.save(newUserObj);
    } catch (e) {
        throw e;
    }
    return newUserObj;
}

export async function deleteUserById(userId: string) {
    //DONE: block the token here
    await blockId(userId)
    const userRepo = getConnection().getCustomRepository(UserRepo)
    try {
        await userRepo.delete(userId)
        return true
    } catch (e) {
        throw e;
    }
}

export async function getUserById(userId: string) {
    const userRepo = getConnection().getCustomRepository(UserRepo)
    return await userRepo.findOne(userId)
}

//TODO implement this
export async function updateUserPrivileges(userId: string, newRole: string) {
    //TODO: block the token here
    throw new Error("update privileges not implemented");
}

async function _getUserRole(id: string) {
    const _usrRepo = getConnection().getCustomRepository(UserRepo);
    return await _usrRepo.getRoleById(id)
}

/**
 * a function to do custom interaction for users 
 * @param role 
 * @param interaction 
 */
function customInteraction(role: string,
    interaction: (repo: Repository<Student | Admin | Professor>) => void) {
    const [userRepo, _] = UserPersistanceFactory(role)
    return interaction(userRepo)
}