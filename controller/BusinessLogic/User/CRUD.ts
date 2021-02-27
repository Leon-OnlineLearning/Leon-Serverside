import UserRepo from "@controller/DataAccess/user-repo";
import { blockId } from "@controller/tokens";
import User from "@models/Users/User";
import UserPersistanceFactory from "@models/Users/UserFactory";
import { getConnection } from "typeorm";

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