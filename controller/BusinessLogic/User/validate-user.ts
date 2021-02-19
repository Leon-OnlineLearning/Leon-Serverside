import UserRepo from "@controller/DataAccess/user-repo";
import { NonExistingUser } from "@models/Users/User";
import UserPersistanceFactory from "@models/Users/UserFactory";
import { comparePasswords } from "@utils/passwords";
import { getCustomRepository } from "typeorm";

const getCorrectUser = async (email: string, password: string) => {
    const repo = getCustomRepository(UserRepo)
    let user: any;
    try {
        user = await repo.findUserAndRoleByEmail(email)
        if (user.length == 0) {
            throw new NonExistingUser("Invalid Email!")
        }
    } catch (error) {
        throw error
    }

    let correctPassword = await comparePasswords(password, user["USERS_password"])
    console.log('correct password: ', correctPassword);

    if (!correctPassword) {
        return false
    } else {
        const [_, userObj] = UserPersistanceFactory(user["USERS_role"])
        userObj.email = user["USERS_email"]
        userObj.firstName = user["USERS_firstName"]
        userObj.lastName = user["USERS_lastName"]
        userObj.thirdPartyAccount = user["USERS_thirdPartyAccount"] === 1
        userObj.password = user["USERS_password"]
        console.log(userObj);

        return {...userObj, role: user["USERS_role"]}
    }
}

export default getCorrectUser;