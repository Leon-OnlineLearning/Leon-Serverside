import User from "@models/Users/User";

export default interface UsersLogic {

    deleteUserById(userId: string): Promise<void>;

    getUserById(userId: string): Promise<User | undefined>;

    updateUserPrivileges(userId: string, newRole: string): Promise<void>

}