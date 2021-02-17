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
}