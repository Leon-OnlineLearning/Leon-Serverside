import Admin from "@models/Users/Admin";
import Professor from "@models/Users/Professor";
import Student from "@models/Users/Student";
import User from "@models/Users/User";
import UserPersistanceFactory from "@models/Users/UserFactory";
import { EntityRepository, getConnection, getRepository, Repository } from "typeorm";

@EntityRepository(User)
export default class UserRepo extends Repository<User>{
    async insertOrIgnore(user: User) {
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
            .where("USERS.id = :id", { id: id })
            .execute();
        return res[0]["USERS_role"]
    }

    async findUserAndRoleByEmail(email: string) {
        const res = await getConnection().createQueryBuilder()
            .select("USERS")
            .from(User, "USERS")
            .where("USERS.email = :email", { email: email })
            .execute();
        return res[0];
    }

    async findUserAndRoleById(id: string) {
        const res = await getConnection().createQueryBuilder()
            .select("USERS")
            .from(User, "USERS")
            .where("USERS.id = :id", { id: id })
            .execute();
        return res;
    }
    async findOrCreate(user: User) {
        let res: User | undefined = await getRepository(Student).findOne({ where: { email: user.email } })
        console.log(res);
        if (res) { return res }
        res = await getRepository(Professor).findOne( { where: { email: user.email } })
        if (res) { return res }
        res = await getRepository(Admin).findOne( { where: { email: user.email } })
        if (res) { return res }
        return await getRepository(Student).save(user)
    }
}