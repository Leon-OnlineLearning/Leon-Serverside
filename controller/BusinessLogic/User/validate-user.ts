import UserRepo from "@controller/DataAccess/user-repo";
import { NonExistingUser } from "@models/Users/User";
import { comparePasswords } from "@utils/passwords";
import { getCustomRepository } from "typeorm";

const verifyPassword = async (email: string, password: string) => {
    const repo = getCustomRepository(UserRepo)
    let user: any;
    try {
        user = await repo.findOne({
            where: {
                email: email
            }
        })
        if (!user) {
            throw new NonExistingUser("Invalid Email!")
        }
    } catch (error) {
        throw error
    }
    let correctPassword = await comparePasswords(password, user["password"])
    if (!correctPassword) {
        return false
    } else {
        return user
    }
}

export default verifyPassword;