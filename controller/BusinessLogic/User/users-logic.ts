import User from "@models/Users/User";

export default interface UsersLogic {

    getUserById(userId: string): Promise<User | undefined>;

    updateUserPrivileges(userId: string, newRole: string): Promise<void>

}