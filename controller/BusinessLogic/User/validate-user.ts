import UserRepo from "@controller/DataAccess/user-repo";
import { NonExistingUser } from "@models/Users/User";
import UserPersistanceFactory from "@models/Users/UserFactory";
import { comparePasswords } from "@utils/passwords";
import { getCustomRepository } from "typeorm";

const getCorrectUser = async (email: string, password: string) => {
    const repo = new UserRepo()
    let user: any;
    user = await repo.findUserAndRoleByEmail(email)
    if (user.length == 0) {
        throw new NonExistingUser("Invalid Email!")
    }

    let correctPassword = await comparePasswords(password, user.password)

    if (!correctPassword) {
        return false
    } else {
        return user
    }
}

export default getCorrectUser;