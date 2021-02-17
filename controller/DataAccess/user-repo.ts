import User from "@models/Users/User";
import { EntityRepository, getConnection, Repository } from "typeorm";

@EntityRepository(User)
export default class UserRepo extends Repository<User>{
    async upsert(user: User){
        await getConnection().createQueryBuilder()
        .insert()
        .into(User)
        .values(user)
        .orIgnore()
        .execute();
    }

    async getRoleById(id: string) {
        const res = await getConnection().createQueryBuilder()
        .select("USERS.role")
        .from(User, "USERS")
        .where("USERS.id = :id", {id: id})
        .execute();
        return res[0]["USERS_role"]
    }

    async findUserAndRoleById(id: string) {
        const res = await getConnection().createQueryBuilder()
        .select("USERS")
        .from(User, "USERS")
        .where("USERS.id = :id", {id: id})
        .execute();
        return res;
    }
}